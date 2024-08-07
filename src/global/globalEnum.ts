export enum AUTH_TYPES {
    LOCAL = 'local',
    GOOGLE = 'gg',
    FACEBOOK = 'fb'
};

export enum ACCOUNT_TYPES {
    USER = 'user',
    ADMIN = 'admin'
};

export enum CONSTANTS_MAX {
    EMAIL_LEN = 100,
    PASSWORD_LEN = 40,
    NAME_LEN = 50,
    USERNAME_LEN = 110,
    SEARCH_LEN = 50,
    PHONETIC_LEN = 50,
    WORD_CONTENT_LEN = 50,
    WORD_MEAN_LEN = 100,
    WORD_NOTE_LEN = 100,
    EXAMPLE_WORD_LEN = 250,
    SYNONYMS_WORD_LEN = 100,
    NOTE_WORD_LEN = 100,
    IMG_SIZE = 2, // 2 MB
    SENTENCE_CONTENT_LEN = 200,
    SENTENCE_MEAN_LEN = 300,
    SENTENCE_NOTE_LEN = 100,
    USER_COIN = 99999,
    VERIFY_CODE = 6
}

export enum CONSTANTS_MIN {
    PASSWORD_LEN = 6
}

export enum PAGE_SIZE {
    PAGE_USER = 20,
    PAGE_CONTRIBUTION = 20,
    PAGE_WORD = 20,
    PAGE_SENTENCE = 20,
    PAGE_IRREGULAR = 20,
    PAGE_FAVORITE = 20,
    PAGE_PRACTICE = 20,
    PAGE_NOTIFICATION = 20,
    PAGE_LEARN_HISTORY = 20,

}
export enum PRACTICE_SIZE {
    PRACTICE_SELECT = 5,
    MAX_PRACTICE_COUNT = 100
}

export enum CONTRIBUTION {
    REFUSED = -1,
    PENDING = 0,
    APPROVED = 1,
    WORD = 'word',
    SENTENCE = 'sentence'
}

export enum VOCABULARY_PACK {
    MAX_WORDS = 100,
    TITLE_LEN = 100

}

export enum PRO_ASSESSMENT {
    NEED_TO_IMPROVE_THRESHOLD = 80,
    NUM_OF_SUGGESTS = 10
}

export enum STATISTICS_GROUPBY {
    MONTH = 'month',
    YEAR = 'year',
    CUSTOM = 'custom'
}