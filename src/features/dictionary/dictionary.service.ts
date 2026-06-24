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
    },
    // Hàm lấy danh sách từ gợi ý
    getSuggestions: async (text: string) => {
        try {
        const res = await axios.get(`https://api.datamuse.com/sug?s=${text}&max=5`);
        return res.data; 
        } catch (error) {
        return [];
        }
    }

}