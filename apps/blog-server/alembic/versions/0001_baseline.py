"""建立用户与评论基础表。"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0001_baseline"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    existing_tables = set(sa.inspect(op.get_bind()).get_table_names())
    if "users" not in existing_tables:
        op.create_table(
            "users",
            sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column("provider", sa.String(32), nullable=False),
            sa.Column("provider_user_id", sa.String(64), nullable=False),
            sa.Column("login", sa.String(255), nullable=False),
            sa.Column("avatar_url", sa.String(2048), nullable=True),
            sa.Column("profile_url", sa.String(2048), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "provider", "provider_user_id", name="uq_user_provider"
            ),
        )
    if "comments" not in existing_tables:
        op.create_table(
            "comments",
            sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column("post_id", sa.BigInteger(), nullable=False),
            sa.Column("user_id", sa.BigInteger(), nullable=False),
            sa.Column("root_id", sa.BigInteger(), nullable=True),
            sa.Column("reply_to_comment_id", sa.BigInteger(), nullable=True),
            sa.Column("body", sa.Text(), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.func.now(),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(["root_id"], ["comments.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(
                ["reply_to_comment_id"], ["comments.id"], ondelete="SET NULL"
            ),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_comments_post_id", "comments", ["post_id"])
        op.create_index("ix_comments_root_id", "comments", ["root_id"])


def downgrade() -> None:
    op.drop_index("ix_comments_root_id", table_name="comments")
    op.drop_index("ix_comments_post_id", table_name="comments")
    op.drop_table("comments")
    op.drop_table("users")
