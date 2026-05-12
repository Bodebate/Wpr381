'use strict';

exports.getContact = (req, res) => res.render('contact');

exports.postEnquiry = (req, res) => {
    console.log('[STUB] Send enquiry:', req.body);
    res.redirect('/contact');
};

exports.getAdminEnquiries = (req, res) => {
    // TODO: fetch enquiries from DB with filters (req.query)
    res.render('enquiries', { enquiries: [] });
};

exports.updateEnquiryStatus = (req, res) => {
    console.log('[STUB] Status change:', req.params.id, req.body.status);
    res.redirect('/admin/enquiries');
};

exports.deleteEnquiry = (req, res) => {
    console.log('[STUB] Delete enquiry:', req.params.id);
    res.redirect('/admin/enquiries');
};
