import { Language } from '../types';

type Tr = { title?: string; location?: string; speakers?: string };

// Бағдарламаның орысша және ағылшынша нұсқалары (іс-шара id бойынша).
// Қазақша мәтін — серверден (админ-панельден) келеді.
export const programI18n: Partial<Record<Language, Record<number, Tr>>> = {
  ru: {
    1: { location: 'Фойе', title: 'Регистрация участников', speakers: 'Преподаватели колледжа' },
    2: { location: 'Зал заседаний', title: 'Вступительное слово', speakers: '1. Исабаева Айнур Сергалиевна, директор КГУ «Областной инновационно-методический центр»\n2. Нурашева Эльмира Нурашқызы, методист отдела методического сопровождения организаций технического и профессионального образования' },
    3: { location: 'Зал заседаний', title: 'Smart Library: система цифровизации библиотеки колледжа', speakers: 'Шаймарданов Қуаныш Нұрланұлы, преподаватель специальных дисциплин ТОО «Высший колледж «Қайнар»' },
    4: { location: 'Зал заседаний', title: '«Роль библиотеки колледжа в формировании читающей нации: культура чтения и возможности искусственного интеллекта»', speakers: 'Жексенаева Нургуль Марденовна, библиотекарь КГУ «Абай колледжі»' },
    5: { location: 'Зал заседаний', title: 'Библиотека 360°: читатель, технологии, опыт', speakers: 'Самыкова Кымбат Ахатаевна, библиотекарь «Педагогического колледжа имени М.О. Ауэзова»' },
    6: { location: 'Зал заседаний', title: 'Культура чтений и искусственный интеллект', speakers: 'Чемесова Фатима Наиловна, библиотекарь КГКП «Высший колледж геодезии, картографии и строительства»' },
    7: { location: 'Зал заседаний', title: 'Искусственный интеллект – новый помощник читателя', speakers: 'Адильбекова Молдир Бектемисовна, заведующая библиотекой ТОО «Высший колледж «Қайнар»' },
    8: { location: 'Зал заседаний', title: '«Читающая нация»: цели и задачи проекта, пути реализации', speakers: 'Аукишева Мейрамгуль Маулитовна, методист отдела технического и профессионального образования «Методического центра» акимата города Астаны, координатор проекта «Читающая нация» по городу Астане' },
    9: { location: 'Зал заседаний', title: 'Презентация учебного пособия «Дактилоскопия»', speakers: 'Балко Владимир Иванович, ветеран-педагог' },
    10: { location: 'Зал заседаний', title: 'Рефлексия', speakers: 'Зарпканова Меруерт Абаевна, заместитель директора ТОО «Высший колледж «Қайнар»;\nСмаилова Айман Жумашевна, заместитель директора колледжа по воспитательной работе' },
    11: { location: 'Зал заседаний', title: 'Заключительное слово', speakers: 'Бижуменова Гайни Кабдрашовна, руководитель областного методического объединения библиотекарей колледжей' },
  },
  en: {
    1: { location: 'Foyer', title: 'Participant registration', speakers: 'College teachers' },
    2: { location: 'Conference hall', title: 'Opening remarks', speakers: '1. Aynur S. Issabayeva, Director of the Regional Innovation and Methodological Center (communal state institution)\n2. Elmira Nurashkyzy Nurasheva, Methodologist, Department of Methodological Support for Technical and Vocational Education Organizations' },
    3: { location: 'Conference hall', title: 'Smart Library: a digitalization system for the college library', speakers: 'Kuanysh N. Shaimardanov, teacher of special subjects, Higher College “Qaynar” LLP' },
    4: { location: 'Conference hall', title: '“The role of the college library in building a reading nation: reading culture and the potential of artificial intelligence”', speakers: 'Nurgul M. Zhexenayeva, librarian, “Abai College” (communal state institution)' },
    5: { location: 'Conference hall', title: 'Library 360°: reader, technology, experience', speakers: 'Kymbat A. Samykova, librarian, “M.O. Auezov Pedagogical College”' },
    6: { location: 'Conference hall', title: 'Reading culture and artificial intelligence', speakers: 'Fatima N. Chemesova, librarian, Higher College of Geodesy, Cartography and Construction' },
    7: { location: 'Conference hall', title: 'Artificial intelligence – the reader’s new assistant', speakers: 'Moldir B. Adilbekova, head of the library, Higher College “Qaynar” LLP' },
    8: { location: 'Conference hall', title: '“Reading Nation” project: goals, objectives and ways of implementation', speakers: 'Meyramgul M. Aukisheva, methodologist, Department of Technical and Vocational Education, Methodological Center of the Astana Akimat, coordinator of the “Reading Nation” project in Astana' },
    9: { location: 'Conference hall', title: 'Presentation of the textbook “Dactyloscopy”', speakers: 'Vladimir I. Balko, veteran educator' },
    10: { location: 'Conference hall', title: 'Reflection', speakers: 'Meruert A. Zarpkanova, Deputy Director, Higher College “Qaynar” LLP;\nAiman Zh. Smailova, Deputy Director for Educational Work' },
    11: { location: 'Conference hall', title: 'Closing remarks', speakers: 'Gaini K. Bizhumenova, head of the regional methodological association of college librarians' },
  },
};
