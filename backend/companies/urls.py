from rest_framework.routers import DefaultRouter

from companies.views import CompanyViewSet, EmployeeViewSet, ProjectViewSet

router = DefaultRouter()
router.register("companies", CompanyViewSet, basename="company")
router.register("employees", EmployeeViewSet, basename="employee")
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = router.urls
