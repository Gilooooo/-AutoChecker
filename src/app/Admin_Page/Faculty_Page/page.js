import Admin_Faculty from "@/Components/Admin Page/Admin_Faculty";
import AdminAside from "@/Components/Default fix/Admin_aside";

function Faculty_Page() {
  return (
    <>
      <div className="d-flex">
        <AdminAside />

        <Admin_Faculty />
      </div>
    </>
  );
}
export default Faculty_Page;
