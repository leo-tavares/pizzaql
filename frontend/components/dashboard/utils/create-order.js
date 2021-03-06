import React, {useState} from 'react';
import {Dialog, Label, Button} from '@blueprintjs/core';
import {useFormState} from 'react-use-form-state';
import {useMutation} from '@apollo/react-hooks';

import {CREATE_ORDER, GET_ORDERS} from '../../api';
import {calculatePrice} from '../../form/utils/price-calculator';

import SelectGroup from '../../form/select-group';
import Input from '../../form/input';
import Price from '../../form/price';
import Submit from '../../form/submit';
import pizzaTypes from '../../form/utils/pizza-types';
import showToaster from './show-toaster';

const CreateOrder = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [formState, {text, select}] = useFormState({
		type: '',
		size: '',
		dough: '',
		name: '',
		phone: '',
		city: '',
		street: '',
		time: '',
		onlinePayment: false
	});
	const [createOrder, {loading, error}] = useMutation(
		CREATE_ORDER,
		{
			update(cache, {data: {createOrder}}) {
				const {orders} = cache.readQuery({query: GET_ORDERS});

				cache.writeQuery({
					query: GET_ORDERS,
					data: {orders: orders.unshift(createOrder)}
				});
			}
		}
	);

	const handleSubmit = async e => {
		e.preventDefault();

		const {values} = formState;

		await createOrder({
			variables: {
				type: values.type,
				size: values.size,
				dough: values.dough,
				name: values.name,
				phone: values.phone,
				time: values.time,
				city: values.city,
				street: values.street,
				paid: false,
				price: calculatePrice(values.type, values.size, values.dough)
			}
		}).then(async () => {
			await setIsOpen(false);

			showToaster('Order added!');
		}).catch(error => {
			console.log(error);
		});
	};

	return (
		<>
			<Button
				style={{marginBottom: '1em'}}
				icon="add"
				loading={loading}
				onClick={() => {
					setIsOpen(true);
				}}
			>
      Add order
			</Button>
			<Dialog
				style={{width: '100%', maxWidth: '50em', margin: '5vw', padding: '2em'}}
				title="Add new order"
				icon="info-sign"
				isOpen={isOpen}
				onClose={() => {
					setIsOpen(false);
				}}
			>

				<form onSubmit={handleSubmit}>
					<br/>
					<SelectGroup>
						<Label style={{width: '11rem', userSelect: 'none'}}>
					Pizza Type:
							<div className="bp3-select">
								<select {...select('type')} name="type" required>
									<option value="">Select</option>
									{pizzaTypes()}
								</select>
							</div>
						</Label>
						<Label style={{width: '11rem', userSelect: 'none'}}>
    Size:
							<div className="bp3-select">
								<select {...select('size')} name="size" required>
									<option value="">Select</option>
									<option value="Small">Small</option>
									<option value="Medium">Medium</option>
									<option value="Large">Large</option>
								</select>
							</div>
						</Label>
						<Label style={{width: '11rem', userSelect: 'none'}}>
    Dough:
							<div className="bp3-select">
								<select {...select('dough')} name="dough" required>
									<option value="">Select</option>
									<option value="Thin">Thin</option>
									<option value="Thick">Thick</option>
								</select>
							</div>
						</Label>
					</SelectGroup>
					<br/>
					<Price amount={calculatePrice(formState.values.type, formState.values.size, formState.values.dough)}/>
					<br/>
					<Label>
				Full name:
						<Input
							{...text('name')}
							className="bp3-input"
							type="text"
							name="name"
							placeholder="Mark Zuckerberg"
							required
						/>
					</Label>
					<Label>
				Phone:
						<Input
							{...text('phone')}
							className="bp3-input"
							type="tel"
							name="phone"
							placeholder="666666666"
							required
						/>
					</Label>
					<Label>
				Address:
						<Input {...text('street')} className="bp3-input" type="text" name="street" placeholder="1 Hacker Way" required/>
					</Label>
					<Label>
				City:
						<Input {...text('city')} className="bp3-input" type="text" name="city" placeholder="Menlo Park" required/>
					</Label>
					<Label>
				Delivery time:
						<Input {...text('time')} className="bp3-input" type="text" name="time" placeholder="12:00" required/>
					</Label>
					<br/>
					<Submit type="submit" text="Submit" loading={loading}/>
					{error && <p>Something went wrong. Try again later.</p>}
				</form>
			</Dialog>
			{error && <p>Error :( Please try again</p>}
		</>
	);
};

export default CreateOrder;
