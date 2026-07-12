"""增加异步审核与 Web Push。"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0002_comment_workflow"
down_revision: str | None = "0001_baseline"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "comments",
        sa.Column("status", sa.String(16), nullable=False, server_default="approved"),
    )
    op.add_column(
        "comments", sa.Column("moderation_category", sa.String(32), nullable=True)
    )
    op.add_column(
        "comments", sa.Column("moderation_reason", sa.String(500), nullable=True)
    )
    op.add_column(
        "comments",
        sa.Column("moderated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.alter_column("comments", "status", server_default="pending")
    op.create_index("ix_comments_status", "comments", ["status"])
    op.create_table(
        "push_subscriptions",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("endpoint", sa.String(2048), nullable=False),
        sa.Column("p256dh", sa.String(256), nullable=False),
        sa.Column("auth", sa.String(256), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("endpoint"),
    )


def downgrade() -> None:
    op.drop_table("push_subscriptions")
    op.drop_index("ix_comments_status", table_name="comments")
    op.drop_column("comments", "moderated_at")
    op.drop_column("comments", "moderation_reason")
    op.drop_column("comments", "moderation_category")
    op.drop_column("comments", "status")
