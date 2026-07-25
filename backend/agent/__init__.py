"""
AI Agent Engine - CongMotCua Academic Affairs Agent
Version: 1.0

This package implements the core AI Agent engine that powers the
one-stop academic affairs portal. It follows a Planner-Executor architecture:

1. Intent Classifier  - Detects user intent
2. State Machine      - Manages workflow states
3. Memory Manager     - Handles session/persistent memory
4. Planner            - Decides next actions
5. Tool Executor      - Executes tool calls
6. Guardrails         - Validates safety constraints
7. Response Generator - Generates user-facing responses
8. Orchestrator       - Coordinates all components
"""

__version__ = "1.0.0"
__author__ = "AI Agent Team"