'use strict';

// ─────────────────────────────────────────────
// APP STATE  (replace with server-side sessions)
// ─────────────────────────────────────────────
const state = {
    currentUser: null,  // { _id, fullName, email, role }
    pricePerTicket: 0,
    editingEnquiryId: null,
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function on(id, evt, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
}

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        firstName: document.getElementById('reg-name').value.trim(),
        surname: document.getElementById('reg-surname').value.trim(),
        email: document.getElementById('reg-email').value,
        phoneNumber: document.getElementById('reg-phone').value,
        password: document.getElementById('reg-password').value,
        role: 'user',
    };
    // TODO: POST /api/auth/register  { body: payload }
    // On 201: state.currentUser = response.user;
    //         window.location.href = 'events.html';
    try{
        const response = await axios.post(window.location.origin+"/register",payload);
        state.currentUser = response.body;
        if(response.data.success){
        window.location.href =response.data.redirect;
        }

    } catch (error) {
        console.error("registration failed",error);
    }

    console.log('[STUB] Register:', payload);
}

async function handleLogin(e) {
    e.preventDefault();
    const payload = {
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
    };
    // TODO: POST /api/auth/login  { body: payload }
    // On 200: state.currentUser = response.user;
    //         if (user.role === 'admin') window.location.href = 'admin-events.html';
    //         else window.location.href = 'events.html';

    try{
        const response = await axios.post(window.location.origin+"/login",payload);
        state.currentUser = response.body;
        if(response.data.success){
        window.location.href =response.data.redirect;
        }

    } catch (error) {
        console.error("login failed",error);
    }


    console.log('[STUB] Login:', payload);
}

// ─────────────────────────────────────────────
// EVENTS — public
// ─────────────────────────────────────────────
async function filterEvents() {
    const q = document.getElementById('events-search').value;
    const from = document.getElementById('filter-from').value;
    const to = document.getElementById('filter-to').value;
    const category = document.getElementById('filter-category').value;
    const seats = document.getElementById('filter-seats').value;
    // TODO: GET /api/events?search=&from=&to=&category=&minSeats=
    //       Re-render #events-list with response data

    const params = new URLSearchParams({search:q, category: category, from: from, to: to, minSeats: seats}) 

    console.log('[STUB] Filter events:', params.toString());

    //const result = await axios.get(window.location.origin+"/filterEvents",payload);
    window.location.href = `/events?${params.toString()}`;
    
}

function toggleCreatePanel(id_input, self_input) {
    const body = document.getElementById(id_input);
    const toggle = document.getElementById(self_input);
    const collapsed = body.style.display === "none";
    body.style.display = collapsed ? "" : "none";
    toggle.textContent = collapsed ? "∨" : "∧";
}

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────
function openBooking(eventName, pricePerTicket, eventId) {
    // Store booking context so bookings.html can read it
    sessionStorage.setItem('booking', JSON.stringify({ eventId, eventName, pricePerTicket }));
    window.location.href = 'bookings';
}

function initBookingPage() {
    // Called on DOMContentLoaded in bookings.html
    const saved = JSON.parse(sessionStorage.getItem('booking') || '{}');
    if (saved.eventName) {
        document.getElementById('booking-event-name').textContent = saved.eventName;
        document.getElementById('booking-unit-price').textContent = 'R ' + saved.pricePerTicket.toFixed(2);
        state.pricePerTicket = saved.pricePerTicket;
        updateTotal();
    }

    on('ticket-amount', 'input', updateTotal);
    on('book-tickets-btn', 'click', handleBookTickets);
}

function updateTotal() {
    const price = state.pricePerTicket ||
        parseFloat(document.getElementById('booking-unit-price')
            .textContent.replace('R ', '')) || 0;
    const qty = Math.max(1, parseInt(document.getElementById('ticket-amount').value) || 1);
    document.getElementById('booking-total').textContent = 'R ' + (qty * price).toFixed(2);
    document.getElementById('qty-check').style.opacity = '1';
}

async function handleBookTickets(e) {
    e.preventDefault();
    const saved = JSON.parse(sessionStorage.getItem('booking') || '{}');
    const qty = Math.max(1, parseInt(document.getElementById('ticket-amount').value) || 1);
    const payload = {
        userId: state.currentUser?._id,
        eventId: saved.eventId,
        quantity: qty,
        totalAmount: +(qty * (saved.pricePerTicket || 0)).toFixed(2),
    };
    // TODO: POST /api/bookings  { body: payload }
    const response = await axios.post("/bookings",payload)
    if (response.status === 201){
        window.location.href= response.data.redirect
    }
    // On 201: refresh booking history (GET /api/bookings?userId=)
    console.log('[STUB] Book tickets:', payload);
}

// ─────────────────────────────────────────────
// ADMIN — EVENTS
// ─────────────────────────────────────────────
function initAdminEventsPage() {
    on('create-event-btn', 'click', handleCreateEvent);
    on('update-event-btn', 'click', handleUpdateEvent);
    on('image-upload-input', 'change', handleImageUpload);

    // wire edit + delete on any cards already in the DOM
    document.querySelectorAll('.edit-event-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            handleEditEvent(e, btn.dataset.id);
        });
    });
    document.querySelectorAll('.delete-event-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            handleDeleteEvent(e, btn.dataset.id);
        });
    });

    // wire Book Now buttons on admin card list
    document.querySelectorAll('.book-now-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            openBooking(btn.dataset.name, parseFloat(btn.dataset.price), btn.dataset.id);
        });
    });
}

function handleCreateEvent(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('new-title').value,
        eventDate: document.getElementById('new-date').value,
        totalCapacity: parseInt(document.getElementById('new-capacity').value),
        availableTickets: parseInt(document.getElementById('new-capacity').value),
        price: parseFloat(document.getElementById('new-price').value),
        categoryId: document.querySelector('input[name="new-cat"]:checked')?.value,
        createdBy: state.currentUser?._id,
        // imageUrl: set after upload completes
    };
    // TODO: POST /api/events  { body: payload }
    // On 201: refresh admin events list
    console.log('[STUB] Create event:', payload);
}

function handleUpdateEvent(e) {
    e.preventDefault();
    const eventId = state.editingEventId || null; // TODO: track which event is being edited in state
    // TODO: PUT /api/events/:id  { body: same shape as create }
    console.log('[STUB] Update event:', eventId);
}

function handleEditEvent(e, eventId) {
    e.preventDefault();
    state.editingEventId = eventId;
    // TODO: GET /api/events/:id
    //       Populate form fields with response data
    console.log('[STUB] Load event for edit:', eventId);
}

function handleDeleteEvent(e, eventId) {
    e.preventDefault();
    if (!confirm('Permanently delete this event?')) return;
    // TODO: DELETE /api/events/:id
    // On 200: remove card from DOM
    console.log('[STUB] Delete event:', eventId);
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    // TODO: POST /api/upload  FormData({ image: file })
    //       On 200: store response.imageUrl in state, preview in form
    console.log('[STUB] Image selected:', file.name);
}

// ─────────────────────────────────────────────
// ADMIN — ANALYTICS
// ─────────────────────────────────────────────
function initAnalyticsPage() {
    document.querySelectorAll('.category-bookings-select').forEach(function(sel) {
        sel.addEventListener('change', function() {
            fetchBookingsByCategory(sel.value);
        });
    });
    document.querySelectorAll('.category-avg-select').forEach(function(sel) {
        sel.addEventListener('change', function() {
            fetchAvgSoldByCategory(sel.value);
        });
    });
}

function fetchBookingsByCategory(category) {
    // TODO: GET /api/analytics/bookings?category=
    //       Update #stat-bookings with response.total
    console.log('[STUB] Bookings by category:', category);
}

function fetchAvgSoldByCategory(category) {
    // TODO: GET /api/analytics/avg-sold?category=
    //       Update #stat-avg with response.avg + '%'
    console.log('[STUB] Avg sold by category:', category);
}

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────
function initContactPage() {
    on('send-enquiry-btn', 'click', handleSendEnquiry);
    console.log("events Loaded")
}

async function handleSendEnquiry(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value,
        status: 'open',
    };
    // TODO: POST /api/enquiries  { body: payload }
    const response = await axios.post('/contact',payload)
    if (response.data.success){
        alert("Request successfully submitted");
        window.location.href=response.data.redirect
    }
    // On 201: clear form, show success message
    console.log('[STUB] Send enquiry:', payload);
}

// ─────────────────────────────────────────────
// ADMIN — ENQUIRIES
// ─────────────────────────────────────────────
function initEnquiriesPage() {
    on('enq-from', 'change', filterEnquiries);
    on('enq-to', 'change', filterEnquiries);
    on('enq-status-filter', 'change', filterEnquiries);
    on('enq-search', 'input', filterEnquiries);
    on('bulk-close-btn', 'click', function() { handleBulkStatus('closed'); });
    on('delete-all-enq-btn', 'click', handleDeleteAllEnquiries);
    on('enq-panel-toggle', 'click', toggleEnquiryPanel);
    on('enq-panel-status', 'change', function(e) {
        handleStatusChange(e, state.editingEnquiryId);
    });

    document.querySelectorAll('.delete-enq-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            handleDeleteEnquiry(e, btn.dataset.id);
        });
    });
    document.querySelectorAll('.edit-enq-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            handleEditEnquiry(e, btn.dataset.id);
        });
    });
}

function filterEnquiries() {
    const from = document.getElementById('enq-from').value;
    const to = document.getElementById('enq-to').value;
    const status = document.getElementById('enq-status-filter').value;
    // TODO: GET /api/enquiries?from=&to=&status=
    //       Re-render #enquiry-list
    console.log('[STUB] Filter enquiries:', { from, to, status });
}

function handleStatusChange(e, enquiryId) {
    const newStatus = e.target.value;
    // TODO: PATCH /api/enquiries/:id  { body: { status: newStatus } }
    console.log('[STUB] Status change:', enquiryId, '->', newStatus);
}

function handleBulkStatus(newStatus) {
    // TODO: PATCH /api/enquiries/bulk  { body: { status: newStatus } }
    console.log('[STUB] Bulk status change ->', newStatus);
}

function handleDeleteEnquiry(e, enquiryId) {
    e.preventDefault();
    if (!confirm('Delete this enquiry?')) return;
    // TODO: DELETE /api/enquiries/:id
    // On 200: remove row from DOM
    console.log('[STUB] Delete enquiry:', enquiryId);
}

function handleDeleteAllEnquiries(e) {
    e.preventDefault();
    if (!confirm('Delete ALL visible enquiries?')) return;
    // TODO: DELETE /api/enquiries/bulk  (pass current filters as query params)
    console.log('[STUB] Delete all enquiries');
}

function handleEditEnquiry(e, enquiryId) {
    e.preventDefault();
    state.editingEnquiryId = enquiryId;
    const panel = document.getElementById('enquiry-detail-panel');
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
        panel.classList.remove('open');
        return;
    }
    // TODO: GET /api/enquiries/:id  then populate:
    //       document.getElementById('enq-d-name').value       = response.name;
    //       document.getElementById('enq-d-email').value      = response.email;
    //       document.getElementById('enq-d-subject').value    = response.subject;
    //       document.getElementById('enq-d-created').value    = response.createdAt;
    //       document.getElementById('enq-d-updated').value    = response.updatedAt;
    //       document.getElementById('enq-d-handler').value    = response.handledBy || '';
    //       document.getElementById('enq-d-message').value    = response.message;
    //       document.getElementById('enq-panel-status').value = response.status;
    panel.classList.add('open');
    console.log('[STUB] Edit enquiry:', enquiryId);
}

function toggleEnquiryPanel() {
    document.getElementById('enquiry-detail-panel').classList.remove('open');
}

function handleUpdateEnquiry(e) {
    e.preventDefault();
    const payload = {
        handledBy: document.getElementById('enq-d-handler').value,
        status: document.getElementById('enq-panel-status').value,
    };
    // TODO: PATCH /api/enquiries/:id  { body: payload }
    // On 200: update the matching row in #enquiry-list, close panel
    console.log('[STUB] Update enquiry:', payload);
}

// ─────────────────────────────────────────────
// BOOT — wire up whichever page we are on
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname.split('/').pop() || 'index.html';

    if (page === 'bookings')     initBookingPage();
    if (page === 'admin-events') initAdminEventsPage();
    if (page === 'analytics')    initAnalyticsPage();
    if (page === 'contact')      initContactPage();
    if (page === 'enquiries')    initEnquiriesPage();
});
