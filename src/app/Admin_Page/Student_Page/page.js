import Admin_Student from "@/Components/Admin Page/Admin_Student";
import AdminAside from "@/Components/Default fix/Admin_aside";

function Student_Page(){
    return(
        <>
            <div className="d-flex">
                <AdminAside/>
                <Admin_Student/>
            </div>
        </>
    )
};
export default Student_Page;