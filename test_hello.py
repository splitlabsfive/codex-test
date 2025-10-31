import builtins

import hello


def test_greet_outputs_name(capsys):
    hello.greet("Alice")
    captured = capsys.readouterr()
    assert captured.out == "Hello, Alice!\n"


def test_ask_and_greet_prompts_and_greets_until_quit(monkeypatch, capsys):
    responses = iter(["Bob", "quit"])
    monkeypatch.setattr(builtins, "input", lambda prompt="": next(responses))
    hello.ask_and_greet()
    captured = capsys.readouterr()
    assert captured.out == "Hello, Bob!\nGoodbye!\n"


def test_ask_and_greet_defaults_to_stranger(monkeypatch, capsys):
    responses = iter(["", "quit"])
    monkeypatch.setattr(builtins, "input", lambda prompt="": next(responses))
    hello.ask_and_greet()
    captured = capsys.readouterr()
    assert captured.out == "Hello, Stranger!\nGoodbye!\n"
