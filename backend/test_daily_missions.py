import pytest

from fastapi import HTTPException

from controllers.task_controller import (
    _build_daily_tasks,
    _normalize_trainer_tasks,
    _resolve_assignment_date,
    _should_refresh_today_tasks,
)


def test_weight_loss_tasks_are_goal_specific():
    tasks = _build_daily_tasks(
        {
            "goal": "weight_loss",
            "calories_goal": 2200,
            "assigned_workout": {"name": "Fat Burn Circuit"},
            "overall_progress": 35,
        }
    )

    assert len(tasks) == 3
    assert tasks[0]["id"] == "weight-loss-1"
    assert "Fat Burn Circuit" in tasks[0]["text"]
    assert "2200" in tasks[1]["text"]
    assert "2L" in tasks[2]["text"]


def test_muscle_gain_tasks_use_protein_and_workout():
    tasks = _build_daily_tasks(
        {
            "goal": "muscle_gain",
            "calories_goal": 2800,
            "macros": {"protein": 155},
            "assigned_workout": {"name": "Upper Push Day"},
        }
    )

    assert len(tasks) == 3
    assert tasks[0]["id"] == "muscle-1"
    assert "Upper Push Day" in tasks[0]["text"]
    assert "155" in tasks[1]["text"]
    assert tasks[1]["category"] == "nutrition"


def test_legacy_static_doc_refresh_only_when_uncompleted():
    legacy_doc = {
        "tasks": [
            {"id": "1", "text": "Morning Jog (30 mins)", "completed": False},
            {"id": "2", "text": "Drink 2L Water", "completed": False},
            {"id": "3", "text": "Strength Training", "completed": False},
        ]
    }

    completed_legacy_doc = {
        "tasks": [
            {"id": "1", "text": "Morning Jog (30 mins)", "completed": True},
            {"id": "2", "text": "Drink 2L Water", "completed": False},
            {"id": "3", "text": "Strength Training", "completed": False},
        ]
    }

    assert _should_refresh_today_tasks(legacy_doc) is True
    assert _should_refresh_today_tasks(completed_legacy_doc) is False


def test_trainer_assigned_doc_never_refreshes():
    trainer_doc = {
        "assignmentSource": "trainer",
        "tasks": [
            {"id": "trainer-1", "text": "Custom trainer task", "completed": False},
        ],
    }

    assert _should_refresh_today_tasks(trainer_doc) is False


def test_normalize_trainer_tasks_filters_blank_and_defaults():
    normalized = _normalize_trainer_tasks(
        [
            {"text": "  Finish interval workout  ", "category": "workout", "priority": "high"},
            {"text": "   "},
            {"text": "Hydrate and log meals", "category": "unknown", "priority": "urgent"},
        ]
    )

    assert len(normalized) == 2
    assert normalized[0]["id"] == "trainer-1"
    assert normalized[0]["text"] == "Finish interval workout"
    assert normalized[0]["category"] == "workout"
    assert normalized[0]["priority"] == "high"
    assert normalized[1]["category"] == "custom"
    assert normalized[1]["priority"] == "medium"


def test_normalize_trainer_tasks_requires_at_least_one_text_task():
    with pytest.raises(HTTPException):
        _normalize_trainer_tasks([{"text": "   "}])


def test_resolve_assignment_date_rejects_invalid_format():
    with pytest.raises(HTTPException):
        _resolve_assignment_date("04-05-2026")
