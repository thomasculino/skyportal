"""phot stat predetection array

Revision ID: c8063723c76e
Revises: 5dc838e75a63
Create Date: 2022-06-23 13:04:14.064957

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c8063723c76e'
down_revision = '5dc838e75a63'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column(
        'photstats', sa.Column('predetection_mjds', sa.ARRAY(sa.Float()), nullable=True)
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('photstats', 'predetection_mjds')
    # ### end Alembic commands ###
