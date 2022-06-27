"""Default observation plans migration

Revision ID: 438a795cbd15
Revises: b771f52a286a
Create Date: 2022-06-09 14:13:05.315502

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '438a795cbd15'
down_revision = 'b771f52a286a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        'defaultobservationplanrequests',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('modified', sa.DateTime(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=True),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('allocation_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['allocation_id'], ['allocations.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_defaultobservationplanrequests_allocation_id'),
        'defaultobservationplanrequests',
        ['allocation_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_defaultobservationplanrequests_created_at'),
        'defaultobservationplanrequests',
        ['created_at'],
        unique=False,
    )
    op.create_index(
        op.f('ix_defaultobservationplanrequests_requester_id'),
        'defaultobservationplanrequests',
        ['requester_id'],
        unique=False,
    )
    op.create_table(
        'default_observationplan_groups',
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('modified', sa.DateTime(), nullable=False),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('defaultobservationplanrequest_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ['defaultobservationplanrequest_id'],
            ['defaultobservationplanrequests.id'],
            ondelete='CASCADE',
        ),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'default_observationplan_groups_forward_ind',
        'default_observationplan_groups',
        ['defaultobservationplanrequest_id', 'group_id'],
        unique=True,
    )
    op.create_index(
        'default_observationplan_groups_reverse_ind',
        'default_observationplan_groups',
        ['group_id', 'defaultobservationplanrequest_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_default_observationplan_groups_created_at'),
        'default_observationplan_groups',
        ['created_at'],
        unique=False,
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(
        op.f('ix_default_observationplan_groups_created_at'),
        table_name='default_observationplan_groups',
    )
    op.drop_index(
        'default_observationplan_groups_reverse_ind',
        table_name='default_observationplan_groups',
    )
    op.drop_index(
        'default_observationplan_groups_forward_ind',
        table_name='default_observationplan_groups',
    )
    op.drop_table('default_observationplan_groups')
    op.drop_index(
        op.f('ix_defaultobservationplanrequests_requester_id'),
        table_name='defaultobservationplanrequests',
    )
    op.drop_index(
        op.f('ix_defaultobservationplanrequests_created_at'),
        table_name='defaultobservationplanrequests',
    )
    op.drop_index(
        op.f('ix_defaultobservationplanrequests_allocation_id'),
        table_name='defaultobservationplanrequests',
    )
    op.drop_table('defaultobservationplanrequests')
    # ### end Alembic commands ###
