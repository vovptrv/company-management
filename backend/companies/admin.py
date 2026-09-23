from django.contrib import admin

from companies.models import Company, Employee, Project

admin.site.register(Company)
admin.site.register(Employee)
admin.site.register(Project)
