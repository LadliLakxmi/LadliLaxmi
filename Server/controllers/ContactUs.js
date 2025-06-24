const { contactUsEmail } = require("../mail/templates/contactFormRes")
const mailSender = require("../utils/mailSender")

exports.contactUsController = async (req, res) => {
  const { email, fullname, message, phoneNo } = req.body
  try {
    const emailRes = await mailSender(
      email,
      "Your Data send successfully",
      contactUsEmail(email, fullname, message, phoneNo)
    )
    return res.json({
      success: true,
      message: "Email send successfully",
    })
  } catch (error) {
    return res.json({
      success: false,
      message: "Something went wrong...",
    })
  }
}
