import React, {useState, useRef} from 'react';
import { Form, Button } from 'react-bootstrap';
import Loader from 'react-loaders';
import QRCode from 'qrcode.react';
import jsPdf from 'jspdf'
import './style.scss';

import firebaseApp from '../../FirebaseHelper';

// import firebase from "firebase";
//
// const firebaseConfig = {
//     apiKey: "AIzaSyC2E4aM8Bz1HTxFnzaHh9XRATsouah_5fk",
//     authDomain: "idea-thon.firebaseapp.com",
//     databaseURL: "https://idea-thon.firebaseio.com",
//     projectId: "idea-thon",
//     storageBucket: "idea-thon.appspot.com",
//     messagingSenderId: "901861991215",
//     appId: "1:901861991215:web:f19bfb2c23912fad25f7da",
//     measurementId: "G-JHWMLGE7SZ"
// };
//
// const firebaseApp = firebase.initializeApp(firebaseConfig);

const qualificationMap = [
    'Uneducated',
    'High School',
    'Intermediate',
    'Graduate or Above'
];

const Register = props => {

    const [validated, setValidated] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [statusEmail, setStatusEmail] = useState('');
    const emailRef = useRef(null);
    const [qualification, setQualification] = useState(0);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const downloadQr = () => {
        const pdf = new jsPdf('l', 'px', [640,480]);
        pdf.setTextColor('#000000');
        pdf.setFontSize(20);
        pdf.text("Here is your Qr Code", 40, 20, {
            baseline: 'top',
            angle: 0,
        });
        pdf.addImage(
            document.getElementById("my-qr").toDataURL({ pixelRatio: 1 }),
            40,
            60,
            250,
            250
        );

        pdf.save('qr_code.pdf');
        // const pngUrl = document.getElementById("my-qr")
        //     .toDataURL("image/png")
        //     .replace("image/png", "image/octet-stream");
        // let downloadLink = document.createElement("a");
        // downloadLink.href = pngUrl;
        // downloadLink.download = "qrCode.png";
        // document.body.appendChild(downloadLink);
        // downloadLink.click();
        // document.body.removeChild(downloadLink);
    }

    const checkStatus = () => {
        setStatusLoading(true);
        firebaseApp.database().ref().child('sales_promoter').once('value').then((snapshot) => {
            let found = false;
            snapshot.forEach((s) => {
                if (s.val().email === statusEmail) {
                    found = true;
                    if (s.val().status === 0) {
                        setStatus(1);
                    }
                    else {
                        setStatus(s.key);
                    }
                    return false;
                }
            });
            if (!found) {
                setStatus(true);
            }
            emailRef.current.value = '';
            setStatusLoading(false);
        });
    }

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidated(true);
        } else {
            event.preventDefault();
            setLoading(true);
            const id = firebaseApp.database().ref().child('sales_promoter').push().key;

            const fileExtension = file.name.split('.').pop();
            const fileNamePath = `docs/${id}.${fileExtension}`;
            const fileRef = firebaseApp.storage().ref().child(fileNamePath);


            fileRef.put(file).then((snapshot) => {
                snapshot.ref.getDownloadURL().then((docUrl) => {
                    firebaseApp.database().ref().child(`sales_promoter/${id}`).set({
                        name: name,
                        email: email,
                        docUrl: docUrl,
                        qualification: qualificationMap[qualification],
                        status: 0,
                    }).then(() => {
                        form.reset();
                        setLoading(false);
                        setValidated(false);
                    });
                });
            });
        }
    };
  return (
    <div className="parent-div">
        <h1 style={{ width: '50%', margin: 'auto'}}>Register</h1>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" onChange={(e) => setName(e.target.value)} placeholder="Enter name" required />
                <Form.Control.Feedback type="invalid">
                    Name field should not be blank.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
                <Form.Text className="text-muted">
                    We'll never share your email with anyone else.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    Please provide a proper email address.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
                <Form.Label>Qualification</Form.Label>
                <Form.Control onChange={(e) => setQualification(e.target.value)} as="select">
                    {qualificationMap.map((q,i) => <option value={i}>{q}</option> )}
                </Form.Control>
            </Form.Group>

            <Form.Group controlId="formBasicAadhar">
                <Form.Label>Document Proof</Form.Label>
                <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} placeholder="Upload Document Proof" accept="image/png,image/gif,image/jpeg image/*" required />
                <Form.Text className="text-muted">
                    It takes time to review the document proof details.
                </Form.Text>
                <Form.Control.Feedback type="invalid">
                    You must upload your document proof to get verified.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group style={{position: 'relative'}}>
                <Button style={{float: 'left', 'marginRight': '20px'}} variant="primary" type="submit">
                    Submit
                </Button>
                <div style={{ height: '38px' }} className={loading ? 'hidden' : ''} />
                <Loader size="md" type="ball-pulse-sync" active={loading} />
            </Form.Group>
        </Form>

        <hr style={{ marginTop: '50px' }} />


        <div style={{ marginTop: '30px' }}>
            <h1 style={{ width: '50%', margin: 'auto'}}>Check Status</h1>
            <Form.Group>
                <Form.Label>Email address</Form.Label>
                <Form.Control ref={emailRef} type="email" onChange={(e) => setStatusEmail(e.target.value)} placeholder="Enter email" required />
            </Form.Group>
            <Form.Group style={{position: 'relative'}}>
                <Button style={{float: 'left', 'marginRight': '20px'}} variant="primary" onClick={checkStatus}>
                    Submit
                </Button>
                <div style={{ height: '38px' }} className={statusLoading ? 'hidden' : ''} />
                <Loader size="md" type="ball-pulse-sync" active={statusLoading} />
            </Form.Group>
        </div>

        <div style={{ marginTop: '50px' }}>
            {(status && (typeof status === "number")) ? <div style={{ width: '50%', margin: 'auto'}}>Your document is under review</div> : null}
            {(status && (typeof status === "boolean")) ? <div style={{ width: '50%', margin: 'auto'}}>Email id not found</div> : null}
            {(status && (typeof status === "string")) ? (
                <div style={{ margin: 'auto' }}>
                    <div style={{ width: '50%', margin: 'auto'}}><h3>Here is your QR Code</h3></div>
                    <div style={{ width: '50%', margin: '16px auto auto' }}>
                        <QRCode id="my-qr" size={window.innerWidth < 500 ? window.innerWidth/2 : 250} value={status} />
                    </div>
                    <div style={{ width: '50%', margin: 'auto', color: '#0069D9' }}><u onClick={downloadQr} style={{ cursor: 'pointer' }}>Download</u></div>
                </div>
            ) : null}
        </div>
    </div>
  );
};

export default Register;
