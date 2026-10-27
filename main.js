/*const student = {
    name:"Rafshan",
    ID: 27,
    Departmant:"Cse",
    Batch:3

}

function student_info9 (profile) {
    console.log("student name:", profile.name)
}

const student_info = (profile) => console.log("student ID:", profile.ID)

student_info(student)

const studentList = [
    { name: "Rafshan", ID: 27 },
    { name: "Anika", ID: 14 },
    { name: "Sajid", ID: 42 }
];


const studentname = studentList.map(std => std.name);

// This prints the final clean array
console.log(studentname);


const earlystd = studentList.filter(student => student.ID < 30)
console.log(earlystd)

const arr = [1,3,4,true,'Bbokachoda']

const result = arr.map((num) => c)*/

/*const fetchUserdata = (callback) => {
    console.log("Fetching user from database..");

    setTimeout(() => {
        const user = { name:"Rafshan", role: "Developer"};
        callback(user)
    },1000);
};



const calSquare = (num, callback) => {
    console.log("Calculating number.....")

    setTimeout(() => {
        const result = num ** 2
        callback(result)
    },1000);

};

calSquare(5, (results) => {
    console.log("The result is:", results);
})

const Userage = new Promise((resolve,reject) => {
    let age = 20

    if (age > 18){
        resolve("Access Granted")
    }
    else{
        reject("Access denied")
    }
});

Userage
      .then((message) => console.log("Sucess:",message))
      .catch((err) => console.log("Failed:",err))

const checkAccess = async() => {
    try {
        const message = await Userage
        console.log("Sucess: ",message);
    }
    catch(err){
        console.log("Error",err);
    }
}

checkAccess()*/

const http = require('http');

const studentList = [
    { name: "Rafshan", ID: 27, Department: "CSE" },
    { name: "Anika", ID: 14, Department: "EEE" },
    { name: "Sajid", ID: 42, Department: "CSE" }
];

const getStudentInfo = async () => {
  try{
    const data = await studentList
    return data
  }catch(err){
    console.log("Failed to fetch data",err)
  }
}

const server = http.createServer(async (req,res) => {
    res.setHeader( 'Content-Type','application/json')

    try {
        if (req.method === 'GET' && req.url === '/info'){
            const students = await getStudentInfo()
            res.writeHead(200)
            res.end(JSON.stringify(students));
        }

        else if (req.method === 'GET' && req.url === '/info/cse'){
            const students = await getStudentInfo()

            const cseStudents = students.filter(std => std.Department === "CSE")
            res.writeHead(200)
            res.end(JSON.stringify(cseStudents));
        }
                else {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Route not found" }));
        }
    }catch(error){
        res.writeHead(500)
        res.end(JSON.stringify({error: "Internal server error"}));
    }
})

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});


