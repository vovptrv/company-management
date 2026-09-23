from rest_framework import serializers

from companies.models import Company, Employee, Project


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = (
            "id",
            "name",
            "description",
            "industry",
            "email",
            "website",
            "created_at",
            "updated_at",
        )

    def validate_name(self, value: str) -> str:
        companies = Company.objects.filter(name__iexact=value)
        if self.instance is not None:
            companies = companies.exclude(pk=self.instance.pk)
        if companies.exists():
            raise serializers.ValidationError("A company with this name already exists.")
        return value


class EmployeeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Employee
        fields = (
            "id",
            "company",
            "company_name",
            "first_name",
            "last_name",
            "email",
            "position",
            "hire_date",
            "created_at",
            "updated_at",
        )

    def validate_email(self, value: str) -> str:
        employees = Employee.objects.filter(email__iexact=value)
        if self.instance is not None:
            employees = employees.exclude(pk=self.instance.pk)
        if employees.exists():
            raise serializers.ValidationError("An employee with this email already exists.")
        return value

    def validate_company(self, value: Company) -> Company:
        if (
            self.instance is not None
            and value.pk != self.instance.company_id
            and self.instance.projects.exists()
        ):
            raise serializers.ValidationError(
                "Cannot change company while the employee is assigned to projects."
            )
        return value


class ProjectSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "company",
            "company_name",
            "employees",
            "name",
            "description",
            "status",
            "start_date",
            "end_date",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs: dict) -> dict:
        company = attrs.get("company", getattr(self.instance, "company", None))
        name = attrs.get("name", getattr(self.instance, "name", None))
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if "employees" in attrs:
            employees = attrs["employees"]
        elif self.instance is not None:
            employees = self.instance.employees.all()
        else:
            employees = []

        errors = {}

        projects = Project.objects.filter(company=company, name__iexact=name)
        if self.instance is not None:
            projects = projects.exclude(pk=self.instance.pk)
        if projects.exists():
            errors["name"] = "A project with this name already exists in this company."

        if any(employee.company_id != company.pk for employee in employees):
            errors["employees"] = "All employees must belong to the project's company."

        if end_date is not None:
            if start_date is None:
                errors["end_date"] = "End date requires a start date."
            elif end_date < start_date:
                errors["end_date"] = "End date cannot be earlier than the start date."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs
