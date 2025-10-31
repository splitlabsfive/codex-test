"""Simple greeting module."""


def greet(name: str) -> None:
    """Print a greeting addressed to the provided name."""
    print(f"Hello, {name}!")


def ask_and_greet() -> None:
    """Prompt for the user's name, greet them, and keep going until they quit."""
    while True:
        name = input("What is your name? ")
        if name == "quit":
            print("Goodbye!")
            break
        if not name:
            name = "Stranger"
        greet(name)


if __name__ == "__main__":
    ask_and_greet()
