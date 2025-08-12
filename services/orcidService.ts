const ORCID_API_URL = 'https://pub.orcid.org/v3.0/';
// In a real-world application, this secret should be stored on the backend.
// The "God Mode" ORCID is base64 encoded to obfuscate it.
const GOD_MODE_ORCID_ENCODED = 'MDAwMC0wMDAwLTAwMDAtMDAwMQ==';

// ORCID iDs have a specific format, e.g., 0000-0001-2345-6789
const ORCID_REGEX = /^(\d{4})-(\d{4})-(\d{4})-(\d{3}[0-9X])$/;

interface OrcidResponse {
    'orcid-identifier': {
        path: string;
    };
    person: {
        name: {
            'given-names': { value: string };
            'family-name': { value: string };
        }
    };
}

/**
 * Verifies an ORCID iD against the public ORCID API.
 * @param orcidId The ORCID iD string to verify.
 * @returns An object containing the full name of the researcher or an error message.
 */
export const verifyOrcid = async (orcidId: string): Promise<{ name: string; error: string }> => {
    if (orcidId === atob(GOD_MODE_ORCID_ENCODED)) {
        return { name: 'Artur [Admin]', error: '' };
    }
    
    if (!ORCID_REGEX.test(orcidId)) {
        return { name: '', error: 'Invalid ORCID iD format.' };
    }

    try {
        const response = await fetch(`${ORCID_API_URL}${orcidId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { name: '', error: 'ORCID iD not found.' };
            }
            throw new Error(`ORCID API responded with status: ${response.status}`);
        }

        const data: OrcidResponse = await response.json();
        
        const givenName = data.person.name['given-names']?.value || '';
        const familyName = data.person.name['family-name']?.value || '';
        const fullName = `${givenName} ${familyName}`.trim();

        if (fullName) {
            return { name: fullName, error: '' };
        } else {
            return { name: '', error: 'Could not extract name from ORCID profile.' };
        }

    } catch (error) {
        console.error('Error verifying ORCID:', error);
        return { name: '', error: 'An unexpected error occurred during verification.' };
    }
};