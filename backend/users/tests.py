from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserModelTests(TestCase):
    def test_create_user_hashes_the_password(self):
        user = User.objects.create_user(
            email="tester@example.com",
            username="tester",
            password="test12345",
        )

        self.assertNotEqual(user.password, "test12345")
        self.assertTrue(user.check_password("test12345"))

    def test_email_is_stored_in_lowercase(self):
        user = User.objects.create_user(
            email="  Tester@Example.COM ",
            username="tester",
            password="test12345",
        )

        self.assertEqual(user.email, "tester@example.com")

    def test_create_superuser_has_staff_and_superuser_flags(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            password="admin12345",
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class AuthenticationAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_user(
            email="tester@example.com",
            username="tester",
            password="test12345",
        )
        cls.token_url = reverse("token_obtain_pair")
        cls.refresh_url = reverse("token_refresh")
        cls.me_url = reverse("current_user")

    def test_valid_credentials_return_token_pair(self):
        response = self.client.post(
            self.token_url,
            {"email": "tester@example.com", "password": "test12345"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_ignores_email_case(self):
        response = self.client.post(
            self.token_url,
            {"email": "Tester@Example.com", "password": "test12345"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_wrong_password_is_rejected(self):
        response = self.client.post(
            self.token_url,
            {"email": "tester@example.com", "password": "wrong-password"},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token_returns_new_access_token(self):
        tokens = self.client.post(
            self.token_url,
            {"email": "tester@example.com", "password": "test12345"},
        ).data

        response = self.client.post(self.refresh_url, {"refresh": tokens["refresh"]})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_anonymous_user_cannot_read_current_user(self):
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_read_current_user(self):
        tokens = self.client.post(
            self.token_url,
            {"email": "tester@example.com", "password": "test12345"},
        ).data
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "tester@example.com")
        self.assertEqual(response.data["username"], "tester")

    def test_invalid_token_is_rejected(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
