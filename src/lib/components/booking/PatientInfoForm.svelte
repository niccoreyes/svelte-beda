<script lang="ts">
	interface PatientInfo {
		givenName: string;
		familyName: string;
		phone: string;
		email: string;
	}

	interface Props {
		value: PatientInfo;
		onChange: (value: PatientInfo) => void;
	}

	let { value, onChange }: Props = $props();

	function updateField<K extends keyof PatientInfo>(field: K, val: string) {
		onChange({ ...value, [field]: val });
	}
</script>

<div class="space-y-4 max-w-md mx-auto">
	<div>
		<label for="given-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			First Name <span class="text-red-500">*</span>
		</label>
		<input
			id="given-name"
			type="text"
			value={value.givenName}
			oninput={(e) => updateField('givenName', e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
			placeholder="John"
		/>
	</div>

	<div>
		<label for="family-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Last Name <span class="text-red-500">*</span>
		</label>
		<input
			id="family-name"
			type="text"
			value={value.familyName}
			oninput={(e) => updateField('familyName', e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
			placeholder="Doe"
		/>
	</div>

	<div>
		<label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Phone
		</label>
		<input
			id="phone"
			type="tel"
			value={value.phone}
			oninput={(e) => updateField('phone', e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
			placeholder="+1 555 123 4567"
		/>
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
			Email
		</label>
		<input
			id="email"
			type="email"
			value={value.email}
			oninput={(e) => updateField('email', e.currentTarget.value)}
			class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
			placeholder="john@example.com"
		/>
	</div>
</div>
