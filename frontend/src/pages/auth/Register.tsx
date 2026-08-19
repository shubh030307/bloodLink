import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Droplet, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const Register = () => {
  const [roleName, setRoleName] = useState<'Donor' | 'Hospital'>('Donor');
  
  // Common
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Donor Specific
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  
  // Hospital Specific
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload: any = {
        name,
        email,
        password,
        roleName
      };

      if (roleName === 'Donor') {
        const birthDate = new Date(dob);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }

        if (calculatedAge < 18 || calculatedAge > 65) {
          setError('You must be between 18 and 65 years old to register as a donor.');
          setLoading(false);
          return;
        }

        payload.age = calculatedAge;
        payload.gender = gender;
        payload.bloodGroup = bloodGroup;
        payload.mobileNumber = mobileNumber;
        payload.address = donorAddress;
        payload.emergencyContact = {
          name: emergencyName,
          mobileNumber: emergencyPhone,
          relationship: emergencyRelation
        };
      } else {
        payload.registrationNumber = registrationNumber;
        payload.contactDetails = contactDetails;
        payload.address = hospitalAddress;
        payload.authorizedPerson = authorizedPerson;
      }

      const response = await api.post('/auth/register', payload);
      const { token, user } = response.data;
      
      login(token, user);
      
      navigate('/');
    } catch (err: any) {
      console.error("Registration failed", err);
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blood-100 text-blood-600 mb-4">
          <Droplet className="w-8 h-8" fill="currentColor" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 mt-2">Join the blood bank network</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex mb-6 space-x-2">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${roleName === 'Donor' ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setRoleName('Donor')}
        >
          Donor
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${roleName === 'Hospital' ? 'bg-blood-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => setRoleName('Hospital')}
        >
          Hospital
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Common Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name {roleName === 'Hospital' ? '(Hospital Name)' : ''}</label>
          <input 
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="••••••••"
          />
        </div>

        {/* Donor Specific Fields */}
        {roleName === 'Donor' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" required value={dob} onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2 glass-input text-gray-900 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select required value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-2 glass-input text-gray-900 text-sm bg-transparent">
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select required value={gender} onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 glass-input text-gray-900 text-sm bg-transparent">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                <input type="tel" required value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="1234567890" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea required value={donorAddress} onChange={(e) => setDonorAddress(e.target.value)}
                className="w-full px-4 py-2 glass-input text-gray-900 text-sm" rows={2}></textarea>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" required value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="Contact Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                  <input type="text" required value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)}
                    className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="e.g. Parent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" required value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="Emergency Phone" />
              </div>
            </div>
          </>
        )}

        {/* Hospital Specific Fields */}
        {roleName === 'Hospital' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input type="text" required value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="REG-1234" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Person</label>
              <input type="text" required value={authorizedPerson} onChange={(e) => setAuthorizedPerson(e.target.value)}
                className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
              <input type="text" required value={contactDetails} onChange={(e) => setContactDetails(e.target.value)}
                className="w-full px-4 py-2 glass-input text-gray-900 text-sm" placeholder="Phone / Email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea required value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)}
                className="w-full px-4 py-2 glass-input text-gray-900 text-sm" rows={2}></textarea>
            </div>
          </>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 px-4 glass-button font-medium flex justify-center items-center mt-6"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Register Account'}
        </button>
      </form>
      
      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account? <Link to="/login" className="font-medium text-blood-600 hover:text-blood-700">Sign in</Link>
      </div>
    </div>
  );
};

export default Register;
