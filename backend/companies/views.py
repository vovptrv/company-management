from rest_framework import viewsets

from companies.models import Company, Employee, Project
from companies.serializers import (
    CompanySerializer,
    EmployeeSerializer,
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
    queryset = Employee.objects.select_related("company")
    serializer_class = EmployeeSerializer
    filterset_fields = ("company",)
    search_fields = ("first_name", "last_name", "email")
    ordering_fields = ("last_name", "created_at")
    ordering = ("last_name", "first_name", "id")


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("company").prefetch_related("employees")
    serializer_class = ProjectSerializer
    filterset_fields = ("company", "status")
    search_fields = ("name",)
    ordering_fields = ("name", "created_at")
    ordering = ("-created_at", "id")
