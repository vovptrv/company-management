from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from companies.models import Company, Employee, Project

User = get_user_model()


class CompanyAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="tester@example.com",
            username="tester",
            password="test12345",
        )
        cls.company = Company.objects.create(
            name="Acme",
            industry=Company.Industry.TECHNOLOGY,
        )
        cls.list_url = reverse("company-list")
        cls.detail_url = reverse("company-detail", args=[cls.company.pk])

    def test_anonymous_user_can_list_companies(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_anonymous_user_can_retrieve_company(self):
        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Acme")

    def test_anonymous_user_cannot_create_company(self):
        response = self.client.post(
            self.list_url,
            {"name": "Globex", "industry": Company.Industry.FINANCE},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Company.objects.count(), 1)

    def test_anonymous_user_cannot_update_company(self):
        response = self.client.patch(self.detail_url, {"name": "Globex"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_anonymous_user_cannot_delete_company(self):
        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Company.objects.count(), 1)

    def test_authenticated_user_can_create_company(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"name": "Globex", "industry": Company.Industry.FINANCE},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.count(), 2)

    def test_authenticated_user_can_update_company(self):
        self.client.force_authenticate(self.user)

        response = self.client.patch(self.detail_url, {"name": "Acme Corp"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertEqual(self.company.name, "Acme Corp")

    def test_authenticated_user_can_delete_company(self):
        self.client.force_authenticate(self.user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Company.objects.count(), 0)

    def test_duplicate_name_is_rejected(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"name": "acme", "industry": Company.Industry.RETAIL},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_companies_can_be_filtered_by_industry(self):
        Company.objects.create(name="Globex", industry=Company.Industry.FINANCE)

        response = self.client.get(
            self.list_url, {"industry": Company.Industry.FINANCE}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Globex")

    def test_companies_can_be_searched_by_name(self):
        Company.objects.create(name="Globex", industry=Company.Industry.FINANCE)

        response = self.client.get(self.list_url, {"search": "glo"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Globex")


class EmployeeAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="tester@example.com",
            username="tester",
            password="test12345",
        )
        cls.company = Company.objects.create(
            name="Acme",
            industry=Company.Industry.TECHNOLOGY,
        )
        cls.employee = Employee.objects.create(
            company=cls.company,
            first_name="John",
            last_name="Doe",
            email="john@acme.test",
            position="Developer",
        )
        cls.list_url = reverse("employee-list")
        cls.detail_url = reverse("employee-detail", args=[cls.employee.pk])

    def test_anonymous_user_can_list_employees(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_anonymous_user_cannot_create_employee(self):
        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "first_name": "Jane",
                "last_name": "Roe",
                "email": "jane@acme.test",
                "position": "Designer",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Employee.objects.count(), 1)

    def test_authenticated_user_can_create_employee(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "first_name": "Jane",
                "last_name": "Roe",
                "email": "jane@acme.test",
                "position": "Designer",
                "hire_date": "2024-01-15",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)
        self.assertEqual(response.data["company_name"], "Acme")

    def test_duplicate_email_is_rejected(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "first_name": "Jane",
                "last_name": "Roe",
                "email": "JOHN@acme.test",
                "position": "Designer",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_employees_can_be_filtered_by_company(self):
        other_company = Company.objects.create(
            name="Globex",
            industry=Company.Industry.FINANCE,
        )
        Employee.objects.create(
            company=other_company,
            first_name="Jane",
            last_name="Roe",
            email="jane@globex.test",
            position="Analyst",
        )

        response = self.client.get(self.list_url, {"company": other_company.pk})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["email"], "jane@globex.test")

    def test_employee_detail_shows_full_projects(self):
        project = Project.objects.create(
            company=self.company,
            name="Website",
            status=Project.Status.ACTIVE,
        )
        project.employees.add(self.employee)

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["projects"],
            [{"id": project.pk, "name": "Website", "status": Project.Status.ACTIVE}],
        )

    def test_projects_cannot_be_assigned_through_the_employee(self):
        project = Project.objects.create(company=self.company, name="Website")
        self.client.force_authenticate(self.user)

        response = self.client.patch(self.detail_url, {"projects": [project.pk]})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.employee.projects.count(), 0)

    def test_company_cannot_be_changed_with_an_active_project(self):
        other_company = Company.objects.create(
            name="Globex",
            industry=Company.Industry.FINANCE,
        )
        project = Project.objects.create(
            company=self.company,
            name="Website",
            status=Project.Status.ACTIVE,
        )
        project.employees.add(self.employee)
        self.client.force_authenticate(self.user)

        response = self.client.patch(self.detail_url, {"company": other_company.pk})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("company", response.data)

    def test_company_can_be_changed_with_only_completed_projects(self):
        other_company = Company.objects.create(
            name="Globex",
            industry=Company.Industry.FINANCE,
        )
        project = Project.objects.create(
            company=self.company,
            name="Website",
            status=Project.Status.COMPLETED,
        )
        project.employees.add(self.employee)
        self.client.force_authenticate(self.user)

        response = self.client.patch(self.detail_url, {"company": other_company.pk})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.company, other_company)

    def test_deleting_company_deletes_its_employees(self):
        self.company.delete()

        self.assertEqual(Employee.objects.count(), 0)


class ProjectAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="tester@example.com",
            username="tester",
            password="test12345",
        )
        cls.company = Company.objects.create(
            name="Acme",
            industry=Company.Industry.TECHNOLOGY,
        )
        cls.employee = Employee.objects.create(
            company=cls.company,
            first_name="John",
            last_name="Doe",
            email="john@acme.test",
            position="Developer",
        )
        cls.other_company = Company.objects.create(
            name="Globex",
            industry=Company.Industry.FINANCE,
        )
        cls.other_employee = Employee.objects.create(
            company=cls.other_company,
            first_name="Jane",
            last_name="Roe",
            email="jane@globex.test",
            position="Analyst",
        )
        cls.project = Project.objects.create(
            company=cls.company,
            name="Website",
            status=Project.Status.ACTIVE,
            start_date=date(2024, 1, 1),
        )
        cls.project.employees.add(cls.employee)
        cls.list_url = reverse("project-list")
        cls.detail_url = reverse("project-detail", args=[cls.project.pk])

    def test_anonymous_user_can_list_projects(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)

    def test_anonymous_user_cannot_create_project(self):
        response = self.client.post(
            self.list_url,
            {"company": self.company.pk, "name": "Mobile app"},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(Project.objects.count(), 1)

    def test_authenticated_user_can_create_project(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "name": "Mobile app",
                "status": Project.Status.PLANNED,
                "employees": [self.employee.pk],
            },
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)
        self.assertEqual(response.data["employees"], [self.employee.pk])

    def test_employees_must_belong_to_the_project_company(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "name": "Mobile app",
                "employees": [self.other_employee.pk],
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("employees", response.data)

    def test_end_date_cannot_precede_start_date(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {
                "company": self.company.pk,
                "name": "Mobile app",
                "start_date": "2024-05-01",
                "end_date": "2024-04-01",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("end_date", response.data)

    def test_duplicate_name_within_company_is_rejected(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"company": self.company.pk, "name": "website"},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_same_name_is_allowed_in_another_company(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.list_url,
            {"company": self.other_company.pk, "name": "Website"},
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_authenticated_user_can_delete_project(self):
        self.client.force_authenticate(self.user)

        response = self.client.delete(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Project.objects.count(), 0)

    def test_projects_can_be_filtered_by_status(self):
        response = self.client.get(self.list_url, {"status": Project.Status.PLANNED})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def membership_url(self, employee: Employee) -> str:
        return reverse("project-membership", args=[self.project.pk, employee.pk])

    def completed_project_with_a_departed_employee(self) -> Project:
        """Build the only state where a project may hold a foreign employee."""
        project = Project.objects.create(
            company=self.company,
            name="Legacy",
            status=Project.Status.COMPLETED,
            start_date=date(2023, 1, 1),
            end_date=date(2023, 6, 1),
        )
        project.employees.add(self.employee)
        self.employee.company = self.other_company
        self.employee.save(update_fields=["company"])
        return project

    def test_anonymous_user_cannot_change_membership(self):
        response = self.client.delete(self.membership_url(self.employee))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.project.employees.count(), 1)

    def test_employee_can_be_added_to_the_project(self):
        teammate = Employee.objects.create(
            company=self.company,
            first_name="Ann",
            last_name="Lee",
            email="ann@acme.test",
            position="Tester",
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(self.membership_url(teammate))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project.employees.count(), 2)
        self.assertEqual(len(response.data["employees"]), 2)

    def test_employee_from_another_company_cannot_be_added(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(self.membership_url(self.other_employee))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("employee", response.data)
        self.assertEqual(self.project.employees.count(), 1)

    def test_employee_can_be_removed_from_the_project(self):
        self.client.force_authenticate(self.user)

        response = self.client.delete(self.membership_url(self.employee))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project.employees.count(), 0)
        self.assertEqual(response.data["employees"], [])

    def test_removing_the_same_employee_twice_succeeds(self):
        self.client.force_authenticate(self.user)
        self.client.delete(self.membership_url(self.employee))

        response = self.client.delete(self.membership_url(self.employee))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.project.employees.count(), 0)

    def test_completed_project_keeps_a_departed_employee_when_edited(self):
        project = self.completed_project_with_a_departed_employee()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse("project-detail", args=[project.pk]),
            {"description": "Archived."},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(project.employees.count(), 1)

    def test_completed_project_cannot_be_reopened_with_a_departed_employee(self):
        project = self.completed_project_with_a_departed_employee()
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse("project-detail", args=[project.pk]),
            {"status": Project.Status.ACTIVE},
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_completed_project_can_be_reopened_with_a_valid_roster(self):
        project = self.completed_project_with_a_departed_employee()
        teammate = Employee.objects.create(
            company=self.company,
            first_name="Ann",
            last_name="Lee",
            email="ann@acme.test",
            position="Tester",
        )
        self.client.force_authenticate(self.user)

        response = self.client.patch(
            reverse("project-detail", args=[project.pk]),
            {"status": Project.Status.ACTIVE, "employees": [teammate.pk]},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(list(project.employees.all()), [teammate])

    def test_deleting_company_deletes_its_projects(self):
        self.company.delete()

        self.assertEqual(Project.objects.count(), 0)
