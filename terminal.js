$(function() {
  // Apply custom prompt with blinking cursor effect
  $('.prompt').html('<span class="user">guest</span><span class="at">@</span><span class="host">rrakman</span><span class="colon">:</span><span class="path">~</span><span class="dollar">#</span> ');

  // Initialize terminal
  var term = new Terminal('#input-line .cmdline', '#container output');
  term.init();
  
  // Add matrix background effect
  addMatrixEffect();
});

// Matrix background effect function
function addMatrixEffect() {
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-bg';
  canvas.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; opacity:0.07;';
  document.body.prepend(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Characters for the matrix effect
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = [];
  
  for (let i = 0; i < columns; i++) {
    drops[i] = 1;
  }
  
  function draw() {
    ctx.fillStyle = 'rgba(12, 12, 22, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      drops[i]++;
    }
  }
  
  setInterval(draw, 33);
  
  // Resize handler
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

var util = util || {};
util.toArray = function(list) {
  return Array.prototype.slice.call(list || [], 0);
};

var Terminal = Terminal || function(cmdLineContainer, outputContainer) {
  window.URL = window.URL || window.webkitURL;
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  var cmdLine_ = document.querySelector(cmdLineContainer);
  var output_ = document.querySelector(outputContainer);

  const CMDS_ = [
    'whoami', 'education', 'security', 'programming', 'interests', 'love', 'media', 'contact', 'blog', 'clear', 'help', 'matrix', 'skills', 'hack', 'date'
  ];
  
  var fs_ = null;
  var cwd_ = null;
  var history_ = [];
  var histpos_ = 0;
  var histtemp_ = 0;

  window.addEventListener('click', function(e) {
    cmdLine_.focus();
  }, false);

  cmdLine_.addEventListener('click', inputTextClick_, false);
  cmdLine_.addEventListener('keydown', historyHandler_, false);
  cmdLine_.addEventListener('keydown', processNewCommand_, false);
  
  // Add tab completion
  cmdLine_.addEventListener('keydown', tabCompletion_, false);

  // Tab completion function
  function tabCompletion_(e) {
    if (e.keyCode === 9) { // Tab key
      e.preventDefault();
      
      // Get current input
      const input = this.value.trim();
      
      // Find matching commands
      const matches = CMDS_.filter(cmd => cmd.startsWith(input));
      
      if (matches.length === 1) {
        // Perfect match, complete the command
        this.value = matches[0] + ' ';
      } else if (matches.length > 1) {
        // Show all matching commands
        output('<div class="command-suggestions">' + 
               matches.map(cmd => `<span class="command-highlight">${cmd}</span>`).join(' ') + 
               '</div>');
      }
    }
  }

  // Add visual effect when typing
  cmdLine_.addEventListener('input', function() {
    const randomDelay = Math.random() * 50 + 50;
    setTimeout(() => {
      // Play soft keystroke sound
      if (Math.random() > 0.7) {
        playKeystrokeSound();
      }
    }, randomDelay);
  });
  
  // Simple keystroke sound effect
  function playKeystrokeSound() {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 600 + Math.random() * 200;
    gainNode.gain.value = 0.05;
    
    oscillator.start();
    
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
    oscillator.stop(context.currentTime + 0.1);
  }

  //
  function inputTextClick_(e) {
    this.value = this.value;
  }

  //
  function historyHandler_(e) {
    if (history_.length) {
      if (e.keyCode == 38 || e.keyCode == 40) {
        if (history_[histpos_]) {
          history_[histpos_] = this.value;
        } else {
          histtemp_ = this.value;
        }
      }

      if (e.keyCode == 38) { // up
        histpos_--;
        if (histpos_ < 0) {
          histpos_ = 0;
        }
      } else if (e.keyCode == 40) { // down
        histpos_++;
        if (histpos_ > history_.length) {
          histpos_ = history_.length;
        }
      }

      if (e.keyCode == 38 || e.keyCode == 40) {
        this.value = history_[histpos_] ? history_[histpos_] : histtemp_;
        this.value = this.value; // Sets cursor to end of input.
      }
    }
  }

  // Typewriter effect for command outputs
  function typewriterEffect(element, text, speed = 10) {
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(typing);
      }
    }, speed);
  }

  // Process new commands
  function processNewCommand_(e) {
    if (e.keyCode == 9) { // tab
      e.preventDefault();
      // Tab completion handled in tabCompletion_
    } else if (e.keyCode == 13) { // enter
      // Save shell history.
      if (this.value) {
        history_[history_.length] = this.value;
        histpos_ = history_.length;
      }

      // Duplicate current input and append to output section.
      var line = this.parentNode.parentNode.cloneNode(true);
      line.removeAttribute('id')
      line.classList.add('line');
      var input = line.querySelector('input.cmdline');
      input.autofocus = false;
      input.readOnly = true;
      output_.appendChild(line);

      if (this.value && this.value.trim()) {
        var args = this.value.split(' ').filter(function(val, i) {
          return val;
        });
        var cmd = args[0].toLowerCase();
        args = args.splice(1); // Remove cmd from arg list.
      }

      // Execute command and scroll to output immediately
      executeCommand(cmd, args);
      scrollToLatestOutput();
      
      this.value = ''; // Clear/setup line for next input.
    }
  }
  
  // Scroll to the latest output
  function scrollToLatestOutput() {
    // Using a slightly longer delay to ensure DOM is fully updated
    setTimeout(() => {
      // Force scroll to bottom of container
      const container = document.getElementById('container');
      container.scrollTop = container.scrollHeight;
      
      // Focus back on the command line
      cmdLine_.focus();
    }, 100);
  }
  
  // Execute commands
  function executeCommand(cmd, args) {
    switch (cmd) {
      case 'clear':
        output_.innerHTML = '';
        return;
      case 'help':
        var result = "<h2>Available Commands</h2>" +
                    "<div class='command-list'>" +
                    "<div><span class='command-highlight'>whoami</span>: Display all my information</div>" +
                    "<div><span class='command-highlight'>education</span>: Display my education information</div>" +
                    "<div><span class='command-highlight'>security</span>: Display my security achievements</div>" +
                    "<div><span class='command-highlight'>programming</span>: Display my programming projects</div>" +
                    "<div><span class='command-highlight'>interests</span>: Display my technical skills</div>" +
                    "<div><span class='command-highlight'>skills</span>: Display my skills with visual graph</div>" +
                    "<div><span class='command-highlight'>contact</span>: Display contact information</div>" +
                    "<div><span class='command-highlight'>blog</span>: Link to my online profiles</div>" +
                    "<div><span class='command-highlight'>matrix</span>: Toggle matrix animation effect</div>" +
                    "<div><span class='command-highlight'>date</span>: Display current date and time</div>" +
                    "<div><span class='command-highlight'>clear</span>: Clear terminal</div>" +
                    "<div><span class='command-highlight'>help</span>: Display this menu</div>" +
                    "</div>";
        output(result);
        break;
      case 'education':
        var result = "<h3>Education</h3>"+"<p>• 1337 Med (42 Network), 2023-Present<br>• Common Core graduate specializing in Systems Programming and Cybersecurity<br>• Advanced projects in Network Security and Low-level Programming</p>";
        output(result);
        break;
      case 'security':
        var result = "<h3>Security Achievements</h3><p>• Champion at Elitesec King of The Hill Event (2024), demonstrating advanced offensive security skills<br>• Top Rankings in MedCTF & LeetSec Competitions (2022-2025)<br>• Lead CTF Event Organizer, designing challenges for LeetSec Cybersecurity Club</p><h3>Security Expertise</h3>• Web Testing & Security<br>• Binary Analysis<br>• OWASP Top 10<br>• WebSocket Security<br>• Authentication Systems<br>• Security Tooling Development</p>";
        output(result);
        break;
      case 'programming':
        var result = "<h3>Notable Projects</h3><p><span class='project-title'>Inception 42</span> (2024)<br>• Virtualized infrastructure using Docker containers and custom networking configurations<br>• Technologies: Docker, Docker-compose, Nginx, WordPress, MariaDB, Network Configuration</p><p><span class='project-title'>ft_transcendence</span> (2025)<br>• Built secure real-time gaming platform with OAuth2.0 and end-to-end encryption<br>• Technologies: Fastify, Prisma, WebSocket Security, Authentication Systems</p>";
        output(result);
        break;
      case 'interests': 
        var result = "<h3>Technical Skills & Interests</h3><p><span class='skill-category'>Security & Tools</span>: Web Testing, Binary Analysis, OWASP Top 10, Burp Suite, IDA, Wireshark<br><span class='skill-category'>Infrastructure</span>: Docker, Nginx, Load Balancing, WebSocket Security, REST APIs, Auth Systems<br><span class='skill-category'>Development</span>: C/C++, Python (Automation & Security), JavaScript, PostgreSQL, MongoDB<br><span class='skill-category'>Languages</span>: Arabic (Native), English (Professional), French (Professional)</p>";
        output(result);
        break;
      case 'blog':
        var result = "<h3>Online Profiles</h3><p><a href=\"https://github.com/rrakman\" target=\"_blank\">GitHub</a> · <a href=\"https://tryhackme.com/p/r3da\" target=\"_blank\">TryHackMe Profile</a></p>";
        output(result);
        break;
      case 'contact':
        var result = "<h3>Contact</h3><div class='contact-info'><div>Email: <span class='contact-value'>redarakm@gmail.com</span></div><div>Phone: <span class='contact-value'>+212637912454</span></div><div>Location: <span class='contact-value'>Tetouan, Morocco</span></div></div>";
        output(result);
        break;
      case 'matrix':
        const matrixCanvas = document.getElementById('matrix-bg');
        if (matrixCanvas) {
          matrixCanvas.style.display = matrixCanvas.style.display === 'none' ? 'block' : 'none';
          output("Matrix effect " + (matrixCanvas.style.display === 'none' ? 'disabled' : 'enabled'));
        } else {
          output("Matrix effect not available. Try refreshing the page.");
        }
        break;
      case 'date':
        const now = new Date();
        const dateOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };
        output("<div class='terminal-date'>" + now.toLocaleDateString("en-US", dateOptions) + "</div>");
        break;
      case 'skills':
        const skillsGraph = createSkillsGraph();
        output(skillsGraph);
        break;
      case 'whoami':
        var result = "<h1>Rida Rakman</h1><p class='subtitle'>Cybersecurity Specialist & Systems Programmer</p><p>Collaborative cybersecurity specialist with expertise in web security, reverse engineering, and systems programming. Skilled in Python automation and security tooling development. Common Core graduate from 1337 Med (42 Network) with proven track record in competitive security events. Demonstrated success in cross-functional team environments, bringing strong communication skills and a collaborative mindset to complex security challenges.</p><h3>Security Achievements</h3><p>• Champion at Elitesec King of The Hill Event (2024)<br>• Top Rankings in MedCTF & LeetSec Competitions (2022-2025)<br>• Lead CTF Event Organizer, designing challenges for LeetSec Cybersecurity Club</p><h3>Technical Skills</h3><p><span class='skill-category'>Security & Tools</span>: Web Testing, Binary Analysis, OWASP Top 10, Burp Suite, IDA, Wireshark<br><span class='skill-category'>Infrastructure</span>: Docker, Nginx, Load Balancing, WebSocket Security, REST APIs, Auth Systems<br><span class='skill-category'>Development</span>: C/C++, Python (Automation & Security), JavaScript, PostgreSQL, MongoDB</p><h3>Notable Projects</h3><p><span class='project-title'>Inception 42</span> (2024)<br>• Virtualized infrastructure using Docker containers and custom networking configurations</p><p><span class='project-title'>ft_transcendence</span> (2025)<br>• Built secure real-time gaming platform with OAuth2.0 and end-to-end encryption</p><h3>Education</h3><p>1337 Med (42 Network), 2023-Present<br>• Common Core graduate specializing in Systems Programming and Cybersecurity</p>";
        output(result);
        break;
      default:
        if (cmd) {
          output(`<div class="error-message">Command not found: <span class="error-cmd">${cmd}</span>. Type <span class="command-highlight">help</span> to see available commands.</div>`);
        }
    };
  }

  // Create skills graph
  function createSkillsGraph() {
    const skills = [
      { name: "Web Security", level: 80 },
      { name: "Binary Analysis", level: 70 },
      { name: "Python", level: 85 },
      { name: "C/C++", level: 95 },
      { name: "Docker", level: 80 },
      { name: "JavaScript", level: 70 }
    ];
    
    let graphHTML = '<h3>Skills Proficiency</h3><div class="skills-container">';
    
    skills.forEach(skill => {
      graphHTML += `
        <div class="skill-item">
          <div class="skill-name">${skill.name}</div>
          <div class="skill-bar-container">
            <div class="skill-bar" style="width: ${skill.level}%">
              <span class="skill-percentage">${skill.level}%</span>
            </div>
          </div>
        </div>
      `;
    });
    
    graphHTML += '</div>';
    return graphHTML;
  }

  
  function formatColumns_(entries) {
    var maxName = entries[0].name;
    util.toArray(entries).forEach(function(entry, i) {
      if (entry.name.length > maxName.length) {
        maxName = entry.name;
      }
    });

    var height = entries.length <= 3 ?
        'height: ' + (entries.length * 15) + 'px;' : '';

    // 12px monospace font yields ~7px screen width.
    var colWidth = maxName.length * 7;

    return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
  }

  function output(html) {
    const outputElement = document.createElement('div');
    outputElement.className = 'output-line';
    outputElement.innerHTML = html;
    output_.appendChild(outputElement);
    
    // Scroll to the newly added output element
    outputElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Cross-browser impl to get document's height.
  function getDocHeight_() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
  }

  //
  return {
    init: function() {
      output('<h1>Rida Rakman</h1><h3>Cybersecurity Specialist & Systems Programmer<br>I specialize in web security, reverse engineering, and security tooling development.</h3><div class="welcome-message"><p>Welcome to my interactive terminal portfolio!</p><p>Type <span class="command-highlight">help</span> for available commands.</p><p>Try <span class="command-highlight">matrix</span> for a cool effect!</p></div>');
    },
    output: output
  }
};
