from flask_wtf import FlaskForm
from wtforms import PasswordField, StringField, DateField, SubmitField, EmailField, SelectField
from wtforms.validators import DataRequired, Email


class RegisterForm(FlaskForm):
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
    degree = [
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
    password = PasswordField('Пароль', validators=[DataRequired()])
    password_again = PasswordField('Повторите пароль', validators=[DataRequired()])
    fio = StringField('ФИО', validators=[DataRequired()])
    gender = SelectField('Пол', choices=[('М', 'Мужской'), ('Ж', 'Женский')], validators=[DataRequired()])
    faculty = SelectField('Факультет', choices=facs, validators=[DataRequired()])
    degree = SelectField('Ступень образования', choices=degree, validators=[DataRequired()])

    submit = SubmitField('Зарегистрироваться')