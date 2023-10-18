import AdminDashboard from "@/Components/Admin Page/Admin";
import AdminAside from "@/Components/Default fix/Admin_aside";


function AdminPage() {

  return (
    <>
      <div className="d-flex">
        <AdminAside/>
        {/* Content */}
        <AdminDashboard />
      </div>
    </>
  );
}
export default AdminPage;
