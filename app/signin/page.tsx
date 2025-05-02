import Header from "../components/Header";
import SignInForm from "../components/SignInForm";


export default function SignInPage() {


    return (
        <div>
            <Header />
            <div className="flex items-center justify-center pt-10 md:pt-20">
                <SignInForm />
            </div>
        </div>
    );
}