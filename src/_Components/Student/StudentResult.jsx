import Link from "next/link";

function StudentResult({ clicked, setClicked }) {
  const handleclick = () => {
    setClicked(!clicked);
  };

  return (
    <main className="w-100 min-vh-100">
      <section className="container-fluid col-12 p-2 d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          <i
            className="d-block d-sm-none bi bi-list fs-5 pe-auto custom-red px-2 rounded"
            onClick={handleclick}
          ></i>
          <Link href={{ pathname: "/Student" }}>
            <i className="bi bi-arrow-left fs-3 custom-black-color d-sm-block d-none"></i>
          </Link>
          <h2 className="m-0 w-100 text-sm-start text-center pe-3">SUMMARY</h2>
        </div>
        <div className="col-sm-8 align-self-sm-center d-flex flex-column">
          <span>Number of Correct Answers:</span>
          <span>Number of Wrong Answers:</span>
          <span>Total Score:</span>
        </div>

        <div className="container border border-dark rounded d-flex flex-column  col-sm-8 align-self-center align-items-center p-2 gap-2 table-responsive table-bordered">
          <table className="table">
            <thead>
              <tr className="text-center">
                <th scope="col">ITEM NO.</th>
                <th scope="col">STUDENT ANSWERS</th>
                <th scope="col">ANSWER KEY</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td>1</td>
                <td>2</td>
                <td>3</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Modal */}

        {/* end modal */}
      </section>
    </main>
  );
}
export default StudentResult;
