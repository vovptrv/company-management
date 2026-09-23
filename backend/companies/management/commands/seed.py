import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from faker import Faker
from faker.exceptions import UniquenessException

from companies.models import Company, Employee, Project

User = get_user_model()

DEMO_EMAIL = "user@example.com"
DEMO_USERNAME = "demo"
DEMO_PASSWORD = "demo12345"


class Command(BaseCommand):
    help = "Seed the database with demo companies, employees and projects."

    requires_migrations_checks = True

    def add_arguments(self, parser):
        parser.add_argument(
            "--companies",
            type=int,
            default=15,
            help="How many companies to create (default: 15).",
        )
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing companies before seeding.",
        )

    def handle(self, *args, **options):
        count = options["companies"]
        if count < 1:
            raise CommandError("--companies must be a positive number.")

        if options["flush"]:
            deleted, _ = Company.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Deleted {deleted} objects."))
        elif Company.objects.exists():
            self.stdout.write("Database already has companies, nothing to seed.")
            return

        fake = Faker()
        employees_created = 0
        projects_created = 0

        try:
            with transaction.atomic():
                demo_user_created = self.create_demo_user()
                for _ in range(count):
                    company = self.create_company(fake)
                    employees = self.create_employees(fake, company)
                    projects = self.create_projects(fake, company, employees)
                    employees_created += len(employees)
                    projects_created += len(projects)
        except UniquenessException as error:
            raise CommandError(
                f"Faker ran out of unique values ({error}). "
                "Try a smaller --companies value."
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {count} companies, {employees_created} employees "
                f"and {projects_created} projects."
            )
        )
        if demo_user_created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created demo user {DEMO_EMAIL} with password {DEMO_PASSWORD}."
                )
            )

    def create_demo_user(self) -> bool:
        """Create a non-staff user so the frontend login can be demonstrated."""
        if User.objects.filter(email=DEMO_EMAIL).exists():
            return False

        User.objects.create_user(
            email=DEMO_EMAIL,
            username=DEMO_USERNAME,
            password=DEMO_PASSWORD,
        )
        return True

    def create_company(self, fake: Faker) -> Company:
        return Company.objects.create(
            name=fake.unique.company(),
            description=fake.catch_phrase(),
            industry=random.choice(Company.Industry.values),
            email=fake.company_email(),
            website=fake.url(),
        )

    def create_employees(self, fake: Faker, company: Company) -> list[Employee]:
        return [
            Employee.objects.create(
                company=company,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=fake.unique.email(),
                position=fake.job(),
                hire_date=fake.date_between(start_date="-5y", end_date="today"),
            )
            for _ in range(random.randint(3, 8))
        ]

    def create_projects(
        self,
        fake: Faker,
        company: Company,
        employees: list[Employee],
    ) -> list[Project]:
        projects = []
        used_names = set()

        for _ in range(random.randint(1, 4)):
            name = fake.catch_phrase()
            if name.lower() in used_names:
                continue
            used_names.add(name.lower())

            status = random.choice(Project.Status.values)
            start_date, end_date = self.project_dates(fake, status)
            project = Project.objects.create(
                company=company,
                name=name,
                description=fake.paragraph(),
                status=status,
                start_date=start_date,
                end_date=end_date,
            )
            # Only employees of the same company may join a project.
            project.employees.set(
                random.sample(employees, k=random.randint(1, len(employees)))
            )
            projects.append(project)

        return projects

    def project_dates(self, fake: Faker, status: str) -> tuple:
        if status == Project.Status.PLANNED:
            return fake.date_between(start_date="today", end_date="+1y"), None

        start_date = fake.date_between(start_date="-2y", end_date="today")
        if status == Project.Status.COMPLETED:
            return start_date, fake.date_between(
                start_date=start_date, end_date="today"
            )

        return start_date, None
