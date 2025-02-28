from flask_wtf import FlaskForm
from wtforms import SelectField, SubmitField, PasswordField, StringField, EmailField
from wtforms.validators import DataRequired, Email, Optional

class UserPutForm(FlaskForm):
    class Meta:
        csrf = False

    facs = [
        ("cs", "Факультет компьютерных наук"),
        ("math", "Факультет математики"),
        ("soc", "Факультет социальных наук"),
        ("wep", "Факультет мировой экономики и мировой политики"),
        ("ci", "Факультет креативных индустрий"),
        ("geo", "Факультет географии и геоинформационных технологий"),
        ("hum", "Факультет гуманитарных наук"),
        ("law", "Факультет права"),
        ("bm", "Факультет бизнеса и менеджмента"),
        ("cmd", "Факультет коммуникаций, медиа и дизайна"),
        ("edu", "Институт образования"),
        ("trans", "Институт экономики транспорта и транспортной политики"),
        ("stat", "Институт статистических исследований и экономики знаний"),
        ("demo", "Институт демографии"),
        ("law_dev", "Институт права и развития"),
        ("miem", "Московский институт электроники и математики (МИЭМ)")
    ]

    degree_choices = [
        ('1', '1 курс бакалавриата'),
        ('2', '2 курс бакалавриата'),
        ('3', '3 курс бакалавриата'),
        ('4', '4 курс бакалавриата'),
        ('5', '1 курс специалитета'),
        ('6', '2 курс специалитета'),
        ('7', '3 курс специалитета'),
        ('8', '4 курс специалитета'),
        ('9', '5 курс специалитета'),
        ('10', '1 курс магистратуры'),
        ('11', '2 курс магистратуры'),
        ('12', '1 курс аспирантуры'),
        ('13', '2 курс аспирантуры'),
        ('14', '3 курс аспирантуры'),
        ('15', 'Выпускник'),
    ]

    email = EmailField('Почта', validators=[DataRequired(), Email()])
    password = PasswordField('Новый пароль', validators=[Optional()])
    fio = StringField('ФИО', validators=[DataRequired()])
    gender = SelectField('Пол', choices=[('М', 'Мужской'), ('Ж', 'Женский')], validators=[DataRequired()], default="М")
    faculty = SelectField('Факультет', choices=facs, validators=[DataRequired()], default="cs")
    degree = SelectField('Ступень образования', choices=degree_choices, validators=[DataRequired()], default="1")

    submit = SubmitField('Изменить')
