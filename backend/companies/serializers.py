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
            raise serializers.ValidationError(
                "A company with this name already exists."
            )
        return value


class EmployeeProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "status")


class EmployeeSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    projects = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = (
            "id",
            "company",
            "company_name",
            "projects",
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
            raise serializers.ValidationError(
                "An employee with this email already exists."
            )
        return value

    def validate_company(self, value: Company) -> Company:
        if (
            self.instance is not None
            and value.pk != self.instance.company_id
            and self.instance.projects.exclude(status=Project.Status.COMPLETED).exists()
        ):
            raise serializers.ValidationError(
                "Can't change company while the employee is assigned to "
                "planned or active projects."
            )
        return value


class EmployeeDetailSerializer(EmployeeSerializer):
    projects = EmployeeProjectSerializer(many=True, read_only=True)


class ProjectEmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ("id", "first_name", "last_name", "position")


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
        errors = {}
        errors.update(self._check_unique_name(attrs))
        errors.update(self._check_employees(attrs))
        errors.update(self._check_dates(attrs))

        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def _resolved(self, attrs: dict, field: str):
        """Return the value the project will have once this request is applied."""
        if field in attrs:
            return attrs[field]
        return getattr(self.instance, field, None)

    def _resolved_employees(self, attrs: dict):
        if "employees" in attrs:
            return attrs["employees"]
        if self.instance is not None:
            return self.instance.employees.all()
        return []

    def _check_unique_name(self, attrs: dict) -> dict:
        projects = Project.objects.filter(
            company=self._resolved(attrs, "company"),
            name__iexact=self._resolved(attrs, "name"),
        )
        if self.instance is not None:
            projects = projects.exclude(pk=self.instance.pk)
        if projects.exists():
            return {"name": "A project with this name already exists in this company."}
        return {}

    def _check_employees(self, attrs: dict) -> dict:
        company = self._resolved(attrs, "company")
        status = self._resolved(attrs, "status")
        employees = self._resolved_employees(attrs)

        reopened = (
            self.instance is not None
            and self.instance.status == Project.Status.COMPLETED
            and status != Project.Status.COMPLETED
        )
        company_changed = (
            self.instance is not None and company.pk != self.instance.company_id
        )
        # Old members of a completed project can be from another company now.
        # Only check new ones, unless the project is reopened or moved - then check all.
        if self.instance is None or reopened or company_changed:
            employees_to_check = employees
        else:
            employees_to_check = set(employees) - set(self.instance.employees.all())

        if all(employee.company_id == company.pk for employee in employees_to_check):
            return {}
        if reopened:
            return {
                "status": "Can't change status of project that has employees "
                "from another company."
            }
        return {"employees": "All employees must belong to the project's company."}

    def _check_dates(self, attrs: dict) -> dict:
        start_date = self._resolved(attrs, "start_date")
        end_date = self._resolved(attrs, "end_date")

        if end_date is None:
            return {}
        if start_date is None:
            return {"end_date": "End date requires a start date."}
        if end_date < start_date:
            return {"end_date": "End date can't be earlier than the start date."}
        return {}


class ProjectDetailSerializer(ProjectSerializer):
    employees = ProjectEmployeeSerializer(many=True, read_only=True)
