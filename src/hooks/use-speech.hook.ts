import { useState, useEffect } from "react";
import Tts from 'react-native-tts';

export const useSpeech = () =>{
    const [isPlaying, setIsPlaying] = useState(false);
    useEffect(()=>{
        Tts.setDefaultLanguage('en-US');
        Tts.setDefaultRate(0.5);
        
        const finishListener=Tts.addListener('tts-finish', ()=> setIsPlaying(false));
        const cancelListener=Tts.addListener('tts-cancel', ()=>setIsPlaying(false));

        return () =>{
            Tts.stop();
            finishListener.remove();
            cancelListener.remove();
        };
    }, []);
    const speak = (text: string) => {
        if(isPlaying){
            Tts.stop();
            setIsPlaying(false);
        } else{
            Tts.speak(text);
            setIsPlaying(true);
        }
    };
    const stop=() =>{
        Tts.stop();
        setIsPlaying(false);
    };
    return {speak, stop, isPlaying}
}