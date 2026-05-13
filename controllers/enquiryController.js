'use strict';

const Enquiry = require('../models/Enquiry');

exports.getContact = (req, res) => res.render('contact');

exports.postEnquiry = async (req, res) => {
  try {
    await Enquiry.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      status: 'open'
    });

    res.redirect('/contact');
  } catch (error) {
    console.error('Post enquiry error:', error);
    res.status(500).send('Could not send enquiry.');
  }
};

exports.getAdminEnquiries = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const enquiries = await Enquiry.find(filter)
      .populate('handledBy')
      .sort({ updatedAt: -1 });

    res.render('enquiries', { enquiries });
  } catch (error) {
    console.error('Get enquiries error:', error);
    res.status(500).send('Could not load enquiries.');
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  try {
    await Enquiry.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        handledBy: req.session.user._id
      },
      { runValidators: true }
    );

    res.redirect('/admin/enquiries');
  } catch (error) {
    console.error('Update enquiry error:', error);
    res.status(500).send('Could not update enquiry.');
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.redirect('/admin/enquiries');
  } catch (error) {
    console.error('Delete enquiry error:', error);
    res.status(500).send('Could not delete enquiry.');
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    await Enquiry.updateMany({}, { status: req.body.status, handledBy: req.session.user._id });
    res.redirect('/admin/enquiries');
  } catch (error) {
    console.error('Bulk update enquiry error:', error);
    res.status(500).send('Could not update enquiries.');
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    await Enquiry.deleteMany({});
    res.redirect('/admin/enquiries');
  } catch (error) {
    console.error('Bulk delete enquiry error:', error);
    res.status(500).send('Could not delete enquiries.');
  }
};
