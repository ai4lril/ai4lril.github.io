"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-config';
import { API_BASE_URL } from '@/lib/api-config';

interface ProfileData {
    occupation?: string;
    education?: string;
    birthplace_village_city?: string;
    birthplace_pincode?: string;
    current_residence_village_city?: string;
    current_residence_pincode?: string;
    workplace_college_village_city?: string;
    workplace_college_pincode?: string;
    phone_number?: string;
}

export default function ProfileSettings() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchProfile(token);
    }, [router]);

    const fetchProfile = async (token: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile({
                occupation: data.occupation || '',
                education: data.education || '',
                birthplace_village_city: data.birthplace_village_city || '',
                birthplace_pincode: data.birthplace_pincode || '',
                current_residence_village_city: data.current_residence_village_city || '',
                current_residence_pincode: data.current_residence_pincode || '',
                workplace_college_village_city: data.workplace_college_village_city || '',
                workplace_college_pincode: data.workplace_college_pincode || '',
                phone_number: data.phone_number || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profile),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    Profile updated successfully!
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Occupation
                        </label>
                        <input
                            type="text"
                            value={profile.occupation || ''}
                            onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Education
                        </label>
                        <input
                            type="text"
                            value={profile.education || ''}
                            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Birthplace (Village/City)
                        </label>
                        <input
                            type="text"
                            value={profile.birthplace_village_city || ''}
                            onChange={(e) => setProfile({ ...profile, birthplace_village_city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Birthplace Pincode
                        </label>
                        <input
                            type="text"
                            value={profile.birthplace_pincode || ''}
                            onChange={(e) => setProfile({ ...profile, birthplace_pincode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Residence (Village/City)
                        </label>
                        <input
                            type="text"
                            value={profile.current_residence_village_city || ''}
                            onChange={(e) => setProfile({ ...profile, current_residence_village_city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Residence Pincode
                        </label>
                        <input
                            type="text"
                            value={profile.current_residence_pincode || ''}
                            onChange={(e) => setProfile({ ...profile, current_residence_pincode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workplace/College (Village/City)
                        </label>
                        <input
                            type="text"
                            value={profile.workplace_college_village_city || ''}
                            onChange={(e) => setProfile({ ...profile, workplace_college_village_city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Workplace/College Pincode
                        </label>
                        <input
                            type="text"
                            value={profile.workplace_college_pincode || ''}
                            onChange={(e) => setProfile({ ...profile, workplace_college_pincode: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={profile.phone_number || ''}
                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
