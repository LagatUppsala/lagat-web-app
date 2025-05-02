import Header from "../components/Header";
import SignUpForm from "../components/SignUpForm";


export default function SignUpPage() {


    return (
        <div>
            <Header />
            <div className="flex items-center justify-center pt-10 md:pt-20">
                <SignUpForm />
            </div>
        </div>
    );
}