const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

const render = require("./lib/htmlRenderer");

//since managers, interns and engineers have one additional property
//only need one additional question to generic employee questions
function getEmployeeQuestions(employeeRole) {
  const employeeQuestions = [
    {
      type: 'input',
      name: 'name',
      message: `What is the ${employeeRole}'s name?`,
    },
    {
      type: 'input',
      name: 'id',
      message: `What is the ${employeeRole}'s id?`,
    },
    {
      type: 'input',
      name: 'email',
      message: `What is the ${employeeRole}'s email?`,
    }
  ]
  switch(employeeRole) {
    case 'Manager':
      employeeQuestions.push({
        type: 'input',
        name: 'officeNumber',
        message: `What is the ${employeeRole}'s office number?`,
      });
      break;
    case 'Intern':
      employeeQuestions.push({
        type: 'input',
        name: 'school',
        message: `What school is the ${employeeRole} currently attending?`,
      });
      break;
    case 'Engineer':
      employeeQuestions.push({
        type: 'input',
        name: 'github',
        message: `What is the ${employeeRole}'s GitHub username?`,
      });
      break;
    default:
      throw new Error('Employee role does not exist!');
  }
  //returning a copy so that additional changes made by other questions
  //will not affect one another
  return employeeQuestions.slice(0);
}

async function askToStart() {
  const intro = [
    {
      type: 'list',
      name: 'isStarting',
      message: "What would you like to do?",
      choices: [
        {
          name: 'Start inputting Manager info',
          value: true,
        },
        {
          name: 'Exit',
          value: false,
        }
      ]
    }
  ];

  console.log(`
Welcome to the Team Roster Generator!
To generate a new roster, you'll be prompted to input information about the team's manager first.
`);
  const answers = await inquirer.prompt(intro);
  return answers.isStarting;
}

async function askAction(teamLength) {
  const actions = [
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'Add an Intern',
        'Add an Engineer',
        'Render Team Roster',
        'Exit without Rendering',
      ]
    }
  ];

  console.log(`\nYour team currently consists of: ${teamLength} member${teamLength > 1 ? 's' : ''}`);
  const answer = await inquirer.prompt(actions);
  return answer.action;
}

async function getEmployeeInfo(role) {
  const questions = getEmployeeQuestions(role);

  console.log(`\n>---- GETTING ${role.toUpperCase()} INFO ----<`);
  const answers = await inquirer.prompt(questions);
  switch(role) {
    case 'Manager':
      return new Manager(answers.name, answers.id, answers.email, answers.officeNumber);
    case 'Intern':
      return new Intern(answers.name, answers.id, answers.email, answers.school);
    case 'Engineer':
      return new Engineer(answers.name, answers.id, answers.email, answers.github);
  }
}

function generateHTMLFile(employees) {
  const OUTPUT_DIR = path.resolve(__dirname, "output");
  const outputPath = path.join(OUTPUT_DIR, "team.html");
  const htmlPage = render(employees);

  console.log('\n>>--- RENDERING HTML --->>');

  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log('\nCreating output directory (output/) ...');
    fs.mkdir(OUTPUT_DIR, (err) => {
      if (err) throw err;

      fs.writeFile(outputPath, htmlPage, (err) => {
        if (err) throw err;
        console.log('\nFile successfully created!\nThanks for using the Roster Generator!');
      });
    });
  } else {
    fs.writeFile(outputPath, htmlPage, (err) => {
      if (err) throw err;
      console.log('\nFile successfully created!\nThanks for using the Roster Generator!');
    });
  }
}

async function runApp() {
  let exitProgram = false;
  const employees = [];

  const isStarting = await askToStart();
  if (isStarting) {
    const manager = await getEmployeeInfo('Manager');
    employees.push(manager);
    console.log('\nThank you! You may now add members to your team.')

    while (!exitProgram) {
      const action = await askAction(employees.length);
      switch(action) {
        case 'Add an Intern':
          const intern = await getEmployeeInfo('Intern');
          employees.push(intern);
          break;
        case 'Add an Engineer':
          const engineer = await getEmployeeInfo('Engineer');
          employees.push(engineer);
          break;
        case 'Render Team Roster':
          generateHTMLFile(employees);
          exitProgram = true;
          break;
        case 'Exit without Rendering':
        default:
          console.log('\nThank you for using the Roster Generator!\nExiting program ...');
          exitProgram = true;
      }
    }
  }
}

runApp();
