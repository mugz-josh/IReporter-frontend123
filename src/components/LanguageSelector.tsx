import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <Select onValueChange={changeLanguage} defaultValue={i18n.language}>
      <SelectTrigger className="w-[140px]">
        <Globe className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sw">Kiswahili</SelectItem>
        <SelectItem value="lg">Luganda</SelectItem>
        <SelectItem value="rn">Runyankole</SelectItem>
        <SelectItem value="xog">Lusoga</SelectItem>
        <SelectItem value="ar">العربية</SelectItem>
        <SelectItem value="pt">Português</SelectItem>
        <SelectItem value="zu">isiZulu</SelectItem>
        <SelectItem value="yo">Yorùbá</SelectItem>
        <SelectItem value="am">አማርኛ</SelectItem>
        <SelectItem value="ha">Hausa</SelectItem>
        <SelectItem value="fr">Français</SelectItem>
        <SelectItem value="luo">Dholuo</SelectItem>
        <SelectItem value="teo">Ateso</SelectItem>
        <SelectItem value="ig">Igbo</SelectItem>
        <SelectItem value="rw">Kinyarwanda</SelectItem>
        <SelectItem value="sn">Shona</SelectItem>
        <SelectItem value="st">Sesotho</SelectItem>
        <SelectItem value="tn">Setswana</SelectItem>
        <SelectItem value="ts">Xitsonga</SelectItem>
        <SelectItem value="ve">Tshivenda</SelectItem>
        <SelectItem value="xh">isiXhosa</SelectItem>
        <SelectItem value="af">Afrikaans</SelectItem>
        <SelectItem value="so">Af-Soomaali</SelectItem>
        <SelectItem value="ti">ትግርኛ</SelectItem>
        <SelectItem value="om">Afaan Oromoo</SelectItem>
        <SelectItem value="ss">SiSwati</SelectItem>
        <SelectItem value="nr">isiNdebele</SelectItem>
        <SelectItem value="nd">isiNdebele (North)</SelectItem>
        <SelectItem value="en">English</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
