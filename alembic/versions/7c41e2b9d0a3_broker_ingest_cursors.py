"""broker ingest cursors

Revision ID: 7c41e2b9d0a3
Revises: 2ea9d9097d08
Create Date: 2026-10-09

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision = "7c41e2b9d0a3"
down_revision = "2ea9d9097d08"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "broker_ingest_cursors",
        sa.Column("broker_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("cursor", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("modified", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["broker_id"], ["brokers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("broker_id", "name"),
    )
    op.create_index(
        op.f("ix_broker_ingest_cursors_created_at"),
        "broker_ingest_cursors",
        ["created_at"],
        unique=False,
    )


def downgrade():
    op.drop_index(
        op.f("ix_broker_ingest_cursors_created_at"), table_name="broker_ingest_cursors"
    )
    op.drop_table("broker_ingest_cursors")
