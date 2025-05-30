"""create rounds

Revision ID: 7ad9d92340b6
Revises: bffbf950d0d3
Create Date: 2025-05-09 19:18:01.176792

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ad9d92340b6'
down_revision: Union[str, None] = 'bffbf950d0d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('games',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('round_id', sa.Integer(), nullable=False),
    sa.Column('board', sa.Integer(), nullable=False),
    sa.Column('white_player', sa.String(length=255), nullable=False),
    sa.Column('black_player', sa.String(length=255), nullable=False),
    sa.Column('result', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['round_id'], ['rounds.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('games')
    # ### end Alembic commands ###
