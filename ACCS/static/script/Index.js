
        const chatsList = document.getElementById('chats');
        const messagesList = document.getElementById('messages');
        const tooltip = document.getElementById('tooltip');
        let currentChatId = null;

        // Load chats
        function loadChats() {
            fetch('/chats')
                .then(response => response.json())
                .then(chats => {
                    chatsList.innerHTML = '';
                    chats.forEach(chat => {
                        const li = document.createElement('li');
                        li.textContent = `${chat.empNumber} ( ${chat.unread_count})`;
                        li.className = chat.unread_count > 0 ? 'unread' : '';
                        li.dataset.empNumber = chat.empNumber;
                        chatsList.appendChild(li);
                    });
                });
        }

        chatsList.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            const empNumber = li.dataset.empNumber;

            if (empNumber) {
                currentChatId = empNumber;

                fetch(`/messages/${empNumber}`)
                    .then(response => response.json())
                    .then(messages => {
                        messagesList.innerHTML = '';
                        messages.forEach(msg => {
                            const li = document.createElement('li');
                            li.className = 'message ' + (msg.messageType === 'sent' ? 'sent' : 'received');
                            li.innerHTML = `
                                <span>${msg.messageType === 'sent' ? 'You' : msg.empNumber}</span>: ${msg.txtMsg}
                                ${msg.messageType !== 'sent' ? `
                                    <div class="message-detail">
                                        <p><strong>Employee Number:</strong> ${msg.empNumber}</p>
                                        <p><strong>Phone:</strong> ${msg.phone}</p>
                                        <p><strong>Crew Qualification:</strong> ${msg.crewqual}</p>
                                        <p><strong>Crew Category:</strong> ${msg.crewcat}</p>
                                        ${msg.Reply ? `<p><strong>Reply:</strong> ${msg.Reply}</p>` : ''}
                                    </div>
                                ` : ''}
                            `;
                            messagesList.appendChild(li);
                        });
                        messagesList.scrollTop = messagesList.scrollHeight;
                    });
            }
        });

        // Event listeners for tooltip
        chatsList.addEventListener('mouseover', (e) => {
            const li = e.target.closest('li');
            const empNumber = li.dataset.empNumber;

            if (empNumber) {
                fetch(`/ChatDetail/${empNumber}`)
                    .then(response => response.json())
                    .then(messages => {
                        tooltip.innerHTML = '';
                        messages.forEach(msg => {
                            const p = document.createElement('p');
                            p.textContent = `${msg.empNumber}: ${msg.txtMsg}`;
                            tooltip.appendChild(p);
                        });
                        tooltip.style.display = 'block';
                        tooltip.style.left = `${e.pageX + 15}px`;
                        tooltip.style.top = `${e.pageY + 15}px`;
                    });
            }
        });

        chatsList.addEventListener('mouseout', () => {
            tooltip.style.display = 'none';
        });

        // Send message
        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('message-input').value.trim();

            if (input === '') {
                alert('Please enter a message.');
                return;
            }

            if (currentChatId) {
                const formData = new FormData();
                formData.append('id', currentChatId);
                formData.append('message', input);

                fetch('/send_message', {
                    method: 'POST',
                    body: formData,
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            const li = document.createElement('li');
                            li.className = 'message sent';
                            li.innerHTML = `
                                <span>You</span>: ${input}
                            `;
                            messagesList.appendChild(li);

                            messagesList.scrollTop = messagesList.scrollHeight;
                            document.getElementById('message-input').value = '';
                        } else {
                            alert('Failed to send message');
                        }
                    })
                    .catch(error => {
                        console.error('Error sending message:', error);
                        alert('Failed to send message');
                    });
            } else {
                alert('Please select a chat');
            }
        });

        loadChats();
        setInterval(loadChats, 1000);
    