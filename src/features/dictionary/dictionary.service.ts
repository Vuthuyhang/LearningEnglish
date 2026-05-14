import axios from "axios";
export const DictaionaryService ={
    getDefinition: async(word: string) => {
        try{
            const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            return res.data[0];
        }
        catch(error){
            throw error;
        }
    }
}