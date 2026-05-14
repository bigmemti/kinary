import { Check, X } from "lucide-react";

export default function CheckX({ condition }: { condition: boolean}){
    return condition? <Check className="inline text-green-500" /> : <X  className="inline text-red-500"/>;
}