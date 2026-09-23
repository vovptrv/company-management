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


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("company")
    serializer_class = EmployeeSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related("company").prefetch_related("employees")
    serializer_class = ProjectSerializer
