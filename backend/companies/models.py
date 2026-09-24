from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Company(TimeStampedModel):
    class Industry(models.TextChoices):
        TECHNOLOGY = "technology", "Technology"
        FINANCE = "finance", "Finance"
        HEALTHCARE = "healthcare", "Healthcare"
        EDUCATION = "education", "Education"
        RETAIL = "retail", "Retail"
        MEDIA = "media", "Media"
        OTHER = "other", "Other"

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    industry = models.CharField(
        max_length=20,
        choices=Industry.choices,
    )
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "companies"
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                name="unique_company_name_case_insensitive",
            ),
        ]

    def __str__(self) -> str:
        return self.name


class Employee(TimeStampedModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="employees",
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    position = models.CharField(max_length=100)
    hire_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["last_name", "first_name"]
        constraints = [
            models.UniqueConstraint(
                Lower("email"),
                name="unique_employee_email_case_insensitive",
            ),
        ]

    def __str__(self) -> str:
        return self.full_name

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Project(TimeStampedModel):
    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="projects",
    )
    employees = models.ManyToManyField(
        Employee,
        related_name="projects",
        blank=True,
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED,
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                "company",
                Lower("name"),
                name="unique_project_name_per_company_case_insensitive",
            ),
            models.CheckConstraint(
                condition=Q(end_date__isnull=True)
                | Q(start_date__isnull=False, end_date__gte=F("start_date")),
                name="project_end_date_after_start_date",
            ),
        ]

    def __str__(self) -> str:
        return self.name
