"""Validate required backend environment variables before deployment."""

from config.settings import Settings


def main() -> None:
    Settings()
    print("Backend configuration validated successfully.")


if __name__ == "__main__":
    main()
