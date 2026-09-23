from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from companies.models import Company, Employee, Project
from companies.serializers import (
    CompanySerializer,
    EmployeeDetailSerializer,
    EmployeeSerializer,
    ProjectDetailSerializer,
    ProjectMemberSerializer,
    ProjectSerializer,
)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filterset_fields = ("industry",)
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")
    ordering = ("name",)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("company").prefetch_related("projects")
    serializer_class = EmployeeSerializer
    filterset_fields = ("company",)
    search_fields = ("first_name", "last_name", "email")
    ordering_fields = ("last_name", "created_at")
    ordering = ("last_name", "first_name", "id")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return EmployeeDetailSerializer
        return EmployeeSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("company").prefetch_related("employees")
    serializer_class = ProjectSerializer
    filterset_fields = ("company", "status")
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")
    ordering = ("-created_at", "id")

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        if self.action == "add_employee":
            return ProjectMemberSerializer
        return ProjectSerializer

    @extend_schema(
        description="Add an employee to the project",
        request=None,
        responses={200: ProjectDetailSerializer},
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="employees/(?P<employee_id>[0-9]+)",
        url_name="membership",
    )
    def add_employee(self, request, pk=None, employee_id=None):
        project = self.get_object()

        serializer = self.get_serializer(
            data={"employee": employee_id},
            context={**self.get_serializer_context(), "project": project},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            ProjectDetailSerializer(project, context=self.get_serializer_context()).data
        )

    @extend_schema(
        description="Remove an employee from the project",
        responses={200: ProjectDetailSerializer},
    )
    @add_employee.mapping.delete
    def remove_employee(self, request, pk=None, employee_id=None):
        project = self.get_object()
        project.employees.remove(employee_id)

        return Response(
            ProjectDetailSerializer(project, context=self.get_serializer_context()).data
        )
