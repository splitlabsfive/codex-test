"""Simple greeting module."""


def greet(name: str) -> None:
    """Print a greeting addressed to the provided name."""
    print(f"Hello, {name}!")


def ask_and_greet() -> None:
    """Prompt for the user's name and greet them."""
    name = input("What is your name? ")
    greet(name)


if __name__ == "__main__":
    ask_and_greet()
