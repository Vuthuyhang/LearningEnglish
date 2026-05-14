import firestore from '@react-native-firebase/firestore';
import { IVocabulary } from './vocab.model';

export const VocabularyService = {
    getVocabularies: async (uid: string) => {
        const snapshot = await firestore()
        .collection('users')
        .doc(uid)
        .collection('vocabularies')
        .orderBy('savedAt', 'desc')
        .get();

        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        }));

    },
    deleteVocabulary: async (uid: string, wordId: string) => {
        await firestore()
        .collection('users')
        .doc(uid)
        .collection('vocabularies')
        .doc(wordId.toLowerCase())
        .delete();
    }
}
