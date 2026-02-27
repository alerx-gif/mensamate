import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const MAGIC_EMAIL_DOMAIN = '@mensamate.local';

/**
 * Generates a memorable sync code like: `SaltyPenguin#8910`
 */
export function generateMagicUsername(): string {
    const dictionary = uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        separator: '',
        style: 'capital',
        length: 2
    });

    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 digit number
    return `${dictionary}#${randomNum}`;
}

/**
 * Converts `SaltyPenguin#8910` -> `SaltyPenguin#8910@mensamate.local`
 */
export function usernameToEmail(username: string): string {
    // Prevent double domains if accidentally passed
    const cleanUsername = username.replace(MAGIC_EMAIL_DOMAIN, '');
    return `${cleanUsername}${MAGIC_EMAIL_DOMAIN}`;
}

/**
 * Converts `SaltyPenguin#8910@mensamate.local` -> `SaltyPenguin#8910`
 */
export function emailToUsername(email: string | undefined | null): string {
    if (!email) return '';
    return email.replace(MAGIC_EMAIL_DOMAIN, '');
}
