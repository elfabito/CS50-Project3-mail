document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views

  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  showEmails(mailbox);
}

function showEmails(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);

      const element0 = document.createElement("div");
      element0.innerHTML = `<table style="width:100%" class="styled-table"><thead >
          <th style="width:15%">From:</th><th style="width:60%">Subject:</th><th  style="width:15%">Date</th></thead></table>`;
      document.querySelector("#emails-view").append(element0);
      for (let i = 0; i < emails.length; i++) {
        const element = document.createElement("div");
        if (emails[i].read == true) {
          element.style.backgroundColor = element.style.backgroundColor =
            "rgb(231, 231, 231)";
        } else {
          element.style.backgroundColor = "greyscale";
        }
        element.id = `${emails[i].id}`;

        element.innerHTML = `<table class="styled-table">
          <td style="width:15%">${emails[i].sender}</td>
          <td style="width:60%">${emails[i].subject}</td>
          <td style="width:15%"> ${emails[i].timestamp}</td>
          </table>`;

        element.addEventListener("click", function () {
          document.querySelector("#emails-view").innerHTML = "";
          getEmail(emails[i].id, mailbox);
          readEmail(emails[i].id, true);
          element.style.backgroundColor = "rgb(231, 231, 231)";
          console.log(element);
        });

        document.querySelector("#emails-view").append(element);
      }
    });
}

function readEmail(id, cond) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: cond,
    }),
  });
}

function replyEmail(sender, subject, bdy, date, recipients) {
  //to check reply body
  compose_email();

  document.getElementById("compose-recipients").value = sender;
  if (subject[0] == "R" && subject[1] == "e") {
    let oldBody = bdy.match(/"([^"]+)"/)[1];
    let newBody = bdy.replace(/"([^"]+)"/, "");
    console.log(oldBody);
    console.log(newBody);
    document.getElementById("compose-subject").value = subject;
    document.getElementById(
      "compose-body"
    ).value = `"On ${date} ${sender} wrote: ${newBody} \n ${oldBody}"\n`;
  } else {
    document.getElementById("compose-subject").value = `Re: ${subject}`;
    document.getElementById(
      "compose-body"
    ).value = `"On ${date} ${sender} wrote:\n ${bdy}"\n`;
  }
}

function getEmail(id, mailbox) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      const element = document.createElement("div");
      const body = document.createElement("div");
      const button = document.createElement("button");
      const button2 = document.createElement("button");
      button2.className = "btn btn-sm btn-outline-primary";
      button2.textContent = "Archive";
      button2.addEventListener("click", () =>
        archivedEmail(email.id, (cond = true))
      );
      console.log(email.recipient);
      const button3 = document.createElement("button");
      button3.className = "btn btn-sm btn-outline-primary";
      button3.textContent = "Unarchive";
      button3.addEventListener("click", () =>
        archivedEmail(email.id, (cond = false))
      );
      let space = document.createTextNode(" ");
      let space2 = document.createTextNode(" ");
      const button4 = document.createElement("button");
      button4.className = "btn btn-sm btn-outline-primary";
      button4.textContent = "Mark as Unread";
      button4.addEventListener("click", () => {
        readEmail(id, false);
        window.alert("Email marked us unread");
      });

      const hr = document.createElement("hr");

      button.className = "btn btn-sm btn-outline-primary";
      button.textContent = "Reply!";
      button.addEventListener("click", () =>
        replyEmail(
          (sender = email.sender),
          (subject = email.subject),
          (bdy = email.body),
          (date = email.timestamp),
          (recipients = email.recipients)
        )
      );
      if (email.subject[0] == "R" && email.subject[1] == "e") {
        let oldBody = email.body.match(/"([^"]+)"/)[1];
        let newBody = email.body.replace(/"([^"]+)"/, "");
        console.log(email.oldBody);
        console.log(email.newBody);

        body.innerHTML = `"On ${email.timestamp} ${email.sender} wrote: ${newBody} <br> ${oldBody}"`;
      } else {
        body.innerHTML = `${email.body}`;
      }
      element.innerHTML = `<b>From:</b> ${email.sender} <br> <b>To:</b> ${email.recipients} <br> 
      <b>Subject:</b> ${email.subject} <br> <b>Date:</b> ${email.timestamp} <br><br>`;
      document.querySelector("#emails-view").append(element);
      document.querySelector("#emails-view").append(button);
      document.querySelector("#emails-view").append(space);
      if (mailbox != "sent") {
        if (email.archived == true) {
          document.querySelector("#emails-view").append(space2);
          document.querySelector("#emails-view").append(button3);
        } else {
          document.querySelector("#emails-view").append(space2);
          document.querySelector("#emails-view").append(button2);
        }
      
      if (email.read == true) {
        document.querySelector("#emails-view").append(space);
        document.querySelector("#emails-view").append(button4);
      }}
      document.querySelector("#emails-view").append(hr);
      document.querySelector("#emails-view").append(body);
    });
}

function archivedEmail(id, cond) {
  console.log(`me clickearon`);

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: cond,
    }),
  });
  if (cond) {
    window.alert("Email Archived");
  } else {
    window.alert("Email Unarchive");
  }
  load_mailbox("inbox");
}

function submitForm() {
  var elements = document.getElementById("compose-form");
  elements.addEventListener("submit", (e) => {
    e.preventDefault();

    let recipient = document.getElementById("compose-recipients").value;
    let subject = document.getElementById("compose-subject").value;
    let body = document.getElementById("compose-body").value;
    console.log(body);
    console.log(recipient);
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: `${recipient}`,
        subject: `${subject}`,
        body: `${body}`,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        load_mailbox("sent");
        console.log(result);
      });
  });
}
